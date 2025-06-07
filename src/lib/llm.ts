// src/lib/llm.ts
import OpenAI from 'openai';

// Initialize Azure OpenAI client with detailed logging
console.log('[INIT] Initializing Azure OpenAI client...');
console.log('[CONFIG] Endpoint:', process.env.AZURE_OPENAI_ENDPOINT);
console.log('[CONFIG] API Version:', process.env.AZURE_OPENAI_API_VERSION);
console.log('[CONFIG] Model Name:', process.env.AZURE_OPENAI_MODEL_NAME);
console.log('[CONFIG] Deployment:', process.env.AZURE_OPENAI_DEPLOYMENT);
console.log('[AUTH] API Key Present:', !!process.env.AZURE_OPENAI_API_KEY);
console.log('[AUTH] API Key Length:', process.env.AZURE_OPENAI_API_KEY?.length || 0);
console.log('[AUTH] API Key Preview:', process.env.AZURE_OPENAI_API_KEY?.substring(0, 8) + '...');

const baseURL = `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`;
console.log('[URL] Full Base URL:', baseURL);

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: baseURL,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION },
  defaultHeaders: {
    'Authorization': `Bearer ${process.env.AZURE_OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
});

/**
 * Generate SQL query using Azure OpenAI GPT-4.1
 * 
 * @param context A string containing the user prompt and database schema.
 * @returns A Promise resolving to the generated SQL query string.
 */
export async function generateSQL(context: string): Promise<string> {
  console.log("=== AZURE OPENAI SQL GENERATION START ===");
  console.log("[INPUT] Context Length:", context.length);
  console.log("[INPUT] Context Preview:", context.substring(0, 200) + "...");
  
  // Verify environment variables before making the call
  const requiredEnvVars = [
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_API_VERSION', 
    'AZURE_OPENAI_MODEL_NAME',
    'AZURE_OPENAI_DEPLOYMENT',
    'AZURE_OPENAI_API_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    const error = `Missing environment variables: ${missingVars.join(', ')}`;
    console.error("[ERROR] Environment Error:", error);
    return `-- Environment Configuration Error: ${error}
-- Please check your .env.local file
SELECT 'Environment configuration incomplete' AS error_message;`;
  }

  try {
    console.log("[API] Making API call to Azure OpenAI...");
    console.log("[REQUEST] Request URL:", `${baseURL}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`);
    
    // Use the deployment name as the model (like in the working example)
    const modelName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1-test';
    console.log("[MODEL] Using model name:", modelName);
    
    const completion = await openai.chat.completions.create({
      model: modelName, // Use deployment name as model name
      messages: [
        {
          role: 'system' as const,
          content: `You are an expert SQL database assistant. Your task is to generate accurate, efficient SQL queries based on user requests and database schema information.

Guidelines:
1. Generate syntactically correct SQL for the given database schema
2. Use proper SQL syntax and best practices
3. Include appropriate comments where helpful
4. If creating views or tables, use meaningful names
5. Handle edge cases and data type compatibility
6. Return ONLY the SQL query without additional explanation unless specifically requested
7. For date operations, use standard SQL date functions
8. Always consider data integrity and relationships between tables

When the user asks to create database objects (views, tables, etc.), generate the appropriate DDL statements.
When the user asks for data queries, generate appropriate SELECT statements.`
        },
        {
          role: 'user' as const,
          content: context
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
      top_p: 0.9
    });

    const generatedSql = completion.choices[0]?.message?.content || '';
    
    console.log("[SUCCESS] API call successful!");
    console.log("[RESPONSE] Response received, length:", generatedSql.length);
    console.log("[OUTPUT] Generated SQL Preview:", generatedSql.substring(0, 200) + "...");
    console.log("=== AZURE OPENAI SQL GENERATION END ===");

    return generatedSql.trim();

  } catch (error: any) {
    console.error("=== AZURE OPENAI ERROR DETAILS ===");
    console.error("[ERROR] Error Type:", error.constructor.name);
    console.error("[ERROR] Error Message:", error.message);
    console.error("[ERROR] Error Code:", error.code);
    console.error("[ERROR] Error Status:", error.status);
    
    // Log more details if available
    if (error.response) {
      console.error("[RESPONSE] Response Status:", error.response.status);
      console.error("[RESPONSE] Response Headers:", error.response.headers);
      console.error("[RESPONSE] Response Data:", error.response.data);
    }
    
    if (error.request) {
      console.error("[REQUEST] Request Details:", {
        url: error.request.url,
        method: error.request.method,
        headers: error.request.headers
      });
    }
    
    console.error("[DEBUG] Full Error Object:", error);
    console.error("=== AZURE OPENAI ERROR DETAILS END ===");
    
    // Provide specific error messages based on error type
    let errorMessage = "Unknown error occurred";
    if (error.status === 401) {
      errorMessage = `Authentication failed. Please check:
1. Your API key is correct and not expired (current length: ${process.env.AZURE_OPENAI_API_KEY?.length})
2. The endpoint URL is correct for your Azure region
3. The deployment name matches your Azure OpenAI deployment
4. You have proper permissions for the deployment
5. Try using Bearer authorization instead of api-key header`;
    } else if (error.status === 404) {
      errorMessage = `Resource not found. Please check:
1. The deployment name (${process.env.AZURE_OPENAI_DEPLOYMENT}) exists
2. The endpoint URL is correct
3. The API version is supported`;
    } else if (error.status === 429) {
      errorMessage = "Rate limit exceeded. Please wait and try again.";
    }
    
    return `-- Error generating SQL: ${error.message}
-- ${errorMessage}
-- Please check your request and try again
SELECT 'SQL generation failed' AS error_message;`;
  }
}

/**
 * Debug data inconsistencies using Azure OpenAI GPT-4.1
 * 
 * @param problemDescription The user's description of the inconsistency.
 * @param relevantSchema The schema information relevant to the problem.
 * @param relevantData Optional data samples related to the inconsistency.
 * @returns A Promise resolving to an object containing an explanation and a proposed SQL fix.
 */
export async function debugInconsistency(
  problemDescription: string,
  relevantSchema: string,
  relevantData?: any
): Promise<{ explanation: string; proposedFix: string | null }> {
  console.log("=== AZURE OPENAI DEBUGGER START ===");
  console.log("[DEBUG] Problem Description:", problemDescription);
  console.log("[SCHEMA] Schema Length:", relevantSchema.length);
  if (relevantData) {
    console.log("[DATA] Additional Data:", JSON.stringify(relevantData, null, 2));
  }

  try {
    const contextPrompt = `Problem Description: ${problemDescription}

${relevantSchema}

${relevantData ? `Relevant Data: ${JSON.stringify(relevantData, null, 2)}` : ''}

Please analyze this data inconsistency issue and provide:
1. A clear explanation of what might be causing the discrepancy
2. A proposed SQL fix if applicable (should be ONLY the SQL DDL/DML statement, no explanatory text)

IMPORTANT: If providing a SQL fix, include ONLY the executable SQL statement (like CREATE VIEW, ALTER VIEW, etc.) without any explanatory text before or after it.

Format your response as JSON:
{
  "explanation": "Your detailed explanation here",
  "proposedFix": "ONLY the SQL statement here, or null if no fix needed"
}`;

    console.log("[API] Making debug API call to Azure OpenAI...");

    // Use the deployment name as the model (like in the working example)
    const modelName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1-test';

    const completion = await openai.chat.completions.create({
      model: modelName, // Use deployment name as model name
      messages: [
        {
          role: 'system' as const,
          content: `You are an expert database analyst specializing in data inconsistency debugging. Your task is to:

1. Analyze the described data inconsistency issues
2. Identify potential root causes such as:
   - Incorrect join conditions
   - Missing or incorrect WHERE clauses
   - Data type mismatches
   - Aggregation errors
   - Missing data in source tables
   - Filtering logic discrepancies
   - Timing issues (data refresh, synchronization)

3. Provide clear, actionable explanations
4. Suggest SQL fixes when appropriate - but ONLY provide the actual SQL statement, no explanatory text
5. Always respond in valid JSON format

Be thorough but concise in your analysis. Focus on the most likely causes based on the schema and problem description.

CRITICAL: For proposedFix, provide ONLY the SQL statement (e.g., "CREATE VIEW..." or "ALTER VIEW...") without any surrounding explanatory text.`
        },
        {
          role: 'user' as const,
          content: contextPrompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500,
      top_p: 0.95
    });

    const response = completion.choices[0]?.message?.content || '';
    
    console.log("✅ Debug API call successful!");
    console.log("📨 Raw response:", response);
    
    try {
      const parsedResponse = JSON.parse(response);
      
      console.log("✅ Successfully parsed JSON response");
      
      // Extract clean SQL from proposedFix if it contains explanatory text
      let cleanProposedFix = parsedResponse.proposedFix;
      if (cleanProposedFix && typeof cleanProposedFix === 'string') {
        // Look for SQL statements (CREATE, ALTER, etc.)
        const sqlMatch = cleanProposedFix.match(/(CREATE\s+(?:OR\s+REPLACE\s+)?VIEW[\s\S]*?;)/i);
        if (sqlMatch) {
          cleanProposedFix = sqlMatch[1].trim();
        }
        // If no SQL pattern found but it's clearly SQL, keep as is
        else if (cleanProposedFix.toLowerCase().includes('create') || 
                 cleanProposedFix.toLowerCase().includes('alter') ||
                 cleanProposedFix.toLowerCase().includes('select')) {
          // Remove any explanatory text before the SQL
          const lines = cleanProposedFix.split('\n');
          const sqlStartIndex = lines.findIndex(line => 
            line.toLowerCase().includes('create') || 
            line.toLowerCase().includes('alter') ||
            line.toLowerCase().includes('select')
          );
          if (sqlStartIndex > 0) {
            cleanProposedFix = lines.slice(sqlStartIndex).join('\n').trim();
          }
        }
      }
      
      console.log("=== AZURE OPENAI DEBUGGER END ===");
      
      return {
        explanation: parsedResponse.explanation || "Unable to analyze the inconsistency.",
        proposedFix: cleanProposedFix || null
      };
      
    } catch (parseError) {
      console.warn("⚠️ Failed to parse JSON response, using fallback format");
      console.warn("Parse error:", parseError);
      
      const explanation = response.includes('explanation') 
        ? response.split('explanation')[1]?.split('proposedFix')[0]?.replace(/[:"]/g, '').trim() 
        : response;
        
      return {
        explanation: explanation || "Analysis completed but response format was unexpected.",
        proposedFix: null
      };
    }

  } catch (error: any) {
    console.error("=== AZURE OPENAI DEBUGGER ERROR ===");
    console.error("[ERROR] Debug Error:", error.message);
    console.error("=== AZURE OPENAI DEBUGGER ERROR END ===");
    
    return {
      explanation: `Error during analysis: ${error.message}`,
      proposedFix: null
    };
  }
}

