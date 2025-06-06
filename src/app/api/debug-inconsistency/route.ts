// src/app/api/debug-inconsistency/route.ts
import { NextResponse } from "next/server";
import { getSchemaInfo } from "@/lib/schemaFetcher";
import { buildDebugContext } from "@/lib/contextBuilder";
import { debugInconsistency } from "@/lib/llm";

export async function POST(request: Request) {
  console.log("[/api/debug-inconsistency] === API ROUTE START ===");
  
  try {
    const { problemDescription } = await request.json();

    if (!problemDescription || typeof problemDescription !== "string") {
      return NextResponse.json({ error: "Invalid problem description provided" }, { status: 400 });
    }

    console.log("[/api/debug-inconsistency] Received problem description:", problemDescription);

    // Get database schema
    const schema = await getSchemaInfo();
    console.log("[/api/debug-inconsistency] Fetched schema:", schema);

    // Extract view names mentioned in the problem description
    const mentionedViews = extractViewNames(problemDescription);
    console.log("[/api/debug-inconsistency] Detected views:", mentionedViews);
    
    // Fetch existing view definitions if any views are mentioned
    let existingViewDefinitions: { [key: string]: any } = {};
    if (mentionedViews.length > 0) {
      try {
        const viewResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/execute-query`, {
          method: 'GET'
        });
        if (viewResponse.ok) {
          const viewData = await viewResponse.json();
          existingViewDefinitions = viewData.allViews || {};
          console.log("[/api/debug-inconsistency] Fetched existing views:", Object.keys(existingViewDefinitions));
        }
      } catch (error) {
        console.warn("[/api/debug-inconsistency] Could not fetch existing views:", error);
      }
    }

    // Build context for LLM
    const additionalContext = Object.keys(existingViewDefinitions).length > 0 
      ? `Existing View Definitions:\n${Object.entries(existingViewDefinitions).map(([name, view]) => 
          `View ${name}:\n${view.definition}\n`
        ).join('\n')}`
      : undefined;
    
    const context = buildDebugContext(problemDescription, schema, additionalContext);
    console.log("[/api/debug-inconsistency] Built debug context for LLM:", context);

    // Call LLM to analyze the inconsistency
    const result = await debugInconsistency(problemDescription, context);
    console.log("[/api/debug-inconsistency] Received result from LLM debugger:", result);

    // If there's a proposed fix and we have existing view definitions, include diff info
    let diffInfo = null;
    if (result.proposedFix && mentionedViews.length > 0) {
      console.log("[/api/debug-inconsistency] Attempting to create diff info...");
      
      // Try to find matching view (case-insensitive)
      let matchedViewName = null;
      let existingDef = null;
      
      for (const mentionedView of mentionedViews) {
        // First try exact match
        if (existingViewDefinitions[mentionedView]) {
          matchedViewName = mentionedView;
          existingDef = existingViewDefinitions[mentionedView].definition;
          break;
        }
        
        // Then try case-insensitive match
        const lowerMentioned = mentionedView.toLowerCase();
        for (const [viewName, viewData] of Object.entries(existingViewDefinitions)) {
          if (viewName.toLowerCase() === lowerMentioned) {
            matchedViewName = viewName;
            existingDef = viewData.definition;
            break;
          }
        }
        
        if (matchedViewName) break;
      }
      
      console.log("[/api/debug-inconsistency] Matched view:", matchedViewName);
      console.log("[/api/debug-inconsistency] Existing definition found:", !!existingDef);
      
      if (matchedViewName && existingDef) {
        diffInfo = {
          viewName: matchedViewName,
          originalSQL: existingDef,
          proposedSQL: result.proposedFix,
          hasChanges: existingDef.trim() !== result.proposedFix.trim()
        };
        console.log("[/api/debug-inconsistency] Diff info created:", diffInfo.hasChanges);
      }
    }

    return NextResponse.json({
      ...result,
      diffInfo
    });

  } catch (error: any) {
    console.error("[/api/debug-inconsistency] Error:", error);
    return NextResponse.json({ 
      error: "Failed to debug inconsistency", 
      details: error.message 
    }, { status: 500 });
  }
}

// Helper function to extract potential view names from problem description
function extractViewNames(description: string): string[] {
  const detectedViews: string[] = [];
  
  // Split by common separators and clean up
  const words = description.split(/[\s,.:;!?()]+/).filter(word => word.length > 0);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const lowerWord = word.toLowerCase();
    
    // Look for word "view" and capture the preceding word as potential view name
    if (lowerWord === 'view' && i > 0) {
      const potentialViewName = words[i - 1];
      if (potentialViewName && !['the', 'a', 'an', 'this', 'that', 'my', 'our'].includes(potentialViewName.toLowerCase())) {
        detectedViews.push(potentialViewName);
      }
    }
    
    // Look for common view naming patterns
    if (
      (word.includes('_') && word.length > 4) || // snake_case
      /^[A-Z][a-z]+[A-Z]/.test(word) || // CamelCase
      /^[a-z]+[A-Z]/.test(word) // camelCase
    ) {
      detectedViews.push(word);
    }
    
    // Specific view names that might be mentioned
    if (['ActiveCustomers', 'activecustomers', 'active_customers', 'customer_summary', 'daily_active_users'].includes(lowerWord)) {
      detectedViews.push(word);
    }
  }
  
  console.log("[/api/debug-inconsistency] Raw detected views:", detectedViews);
  return [...new Set(detectedViews)]; // Remove duplicates
}

