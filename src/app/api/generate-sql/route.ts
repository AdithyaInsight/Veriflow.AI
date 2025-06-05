// src/app/api/generate-sql/route.ts
import { NextResponse } from "next/server";
import { getSchemaInfo } from "@/lib/schemaFetcher";
import { buildContext } from "@/lib/contextBuilder";
import { generateSQL } from "@/lib/llm";

export async function POST(request: Request) {
  console.log("🌟 === API ROUTE: /api/generate-sql START ===");
  
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      console.error("❌ Invalid prompt provided:", prompt);
      return NextResponse.json({ error: "Invalid prompt provided" }, { status: 400 });
    }

    console.log("📝 [API] Received prompt:", prompt);
    console.log("📝 [API] Prompt length:", prompt.length);

    // 1. Fetch Schema
    console.log("🔍 [API] Fetching database schema...");
    const schema = await getSchemaInfo();
    console.log("📊 [API] Fetched schema:", schema);
    console.log("📊 [API] Schema tables found:", schema.map(s => s.TABLE_NAME).filter((v, i, a) => a.indexOf(v) === i));

    // 2. Build Context
    console.log("🔨 [API] Building context for LLM...");
    const context = buildContext(prompt, schema);
    console.log("📋 [API] Context length:", context.length);
    console.log("📋 [API] Context preview:", context.substring(0, 300) + "...");

    // 3. Call LLM
    console.log("🤖 [API] Calling Azure OpenAI LLM...");
    const generatedSql = await generateSQL(context);
    console.log("✅ [API] Received SQL from LLM");
    console.log("📝 [API] Generated SQL length:", generatedSql.length);
    console.log("📝 [API] Generated SQL preview:", generatedSql.substring(0, 200) + "...");

    // 4. Return SQL
    const response = { sql: generatedSql };
    console.log("📤 [API] Sending response to client");
    console.log("🌟 === API ROUTE: /api/generate-sql END ===");
    
    return NextResponse.json(response);

  } catch (error: any) {
    console.error("🔥 === API ROUTE ERROR ===");
    console.error("❌ [API] Error type:", error.constructor.name);
    console.error("❌ [API] Error message:", error.message);
    console.error("❌ [API] Error stack:", error.stack);
    console.error("🔥 === API ROUTE ERROR END ===");
    
    return NextResponse.json({ 
      error: "Failed to generate SQL", 
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

