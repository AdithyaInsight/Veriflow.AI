// src/app/api/debug-inconsistency/route.ts
import { NextResponse } from "next/server";
import { getSchemaInfo } from "@/lib/schemaFetcher";
import { buildDebugContext } from "@/lib/contextBuilder";
import { debugInconsistency } from "@/lib/llm";

export async function POST(request: Request) {
  try {
    const { problemDescription } = await request.json();

    if (!problemDescription || typeof problemDescription !== "string") {
      return NextResponse.json({ error: "Invalid problem description provided" }, { status: 400 });
    }

    console.log("[/api/debug-inconsistency] Received problem description:", problemDescription);

    // 1. Fetch Schema
    const schema = await getSchemaInfo();
    console.log("[/api/debug-inconsistency] Fetched schema:", schema);
    
    // 2. Build enhanced context for debugging
    const debugContext = buildDebugContext(problemDescription, schema);
    console.log("[/api/debug-inconsistency] Built debug context for LLM:", debugContext);

    // 3. Call LLM Debugger with enhanced context
    const debugResult = await debugInconsistency(problemDescription, debugContext);
    console.log("[/api/debug-inconsistency] Received result from LLM debugger:", debugResult);

    // 4. Return Debug Result
    return NextResponse.json(debugResult);

  } catch (error: any) {
    console.error("[/api/debug-inconsistency] Error processing request:", error);
    return NextResponse.json({ error: "Failed to debug inconsistency", details: error.message }, { status: 500 });
  }
}

