// src/app/api/generate-sql/route.ts
import { NextResponse } from "next/server";
import { getSchemaInfo } from "@/lib/schemaFetcher";
import { buildContext } from "@/lib/contextBuilder";
import { generateSQL } from "@/lib/llm";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid prompt provided" }, { status: 400 });
    }

    console.log("[/api/generate-sql] Received prompt:", prompt);

    // 1. Fetch Schema
    const schema = await getSchemaInfo();
    console.log("[/api/generate-sql] Fetched schema:", schema);

    // 2. Build Context
    const context = buildContext(prompt, schema);
    console.log("[/api/generate-sql] Built context for LLM:", context);

    // 3. Call LLM (Placeholder)
    const generatedSql = await generateSQL(context);
    console.log("[/api/generate-sql] Received SQL from LLM wrapper:", generatedSql);

    // 4. Return SQL
    return NextResponse.json({ sql: generatedSql });

  } catch (error: any) {
    console.error("[/api/generate-sql] Error processing request:", error);
    return NextResponse.json({ error: "Failed to generate SQL", details: error.message }, { status: 500 });
  }
}

