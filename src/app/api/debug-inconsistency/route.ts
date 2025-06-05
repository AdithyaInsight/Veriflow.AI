// src/app/api/debug-inconsistency/route.ts
import { NextResponse } from "next/server";
import { getSchemaInfo } from "@/lib/schemaFetcher";
import { debugInconsistency } from "@/lib/llm";

// Helper function to format schema info into a string for the LLM
function formatSchemaForLLM(schema: Awaited<ReturnType<typeof getSchemaInfo>>): string {
  let schemaString = "Database Schema:\n";
  const tables: { [tableName: string]: { COLUMN_NAME: string; DATA_TYPE: string }[] } = {};
  schema.forEach(col => {
    if (!tables[col.TABLE_NAME]) {
      tables[col.TABLE_NAME] = [];
    }
    tables[col.TABLE_NAME].push({ COLUMN_NAME: col.COLUMN_NAME, DATA_TYPE: col.DATA_TYPE });
  });

  for (const tableName in tables) {
    schemaString += `Table: ${tableName}\n`;
    tables[tableName].forEach(col => {
      schemaString += `  - ${col.COLUMN_NAME} (${col.DATA_TYPE})\n`;
    });
    schemaString += "\n";
  }
  return schemaString;
}

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
    const schemaString = formatSchemaForLLM(schema);
    console.log("[/api/debug-inconsistency] Formatted schema for LLM:", schemaString);

    // 2. Call LLM Debugger (Placeholder)
    // In a real scenario, you might also fetch relevant view definitions or data samples here
    // For lowdb, this is simpler - we mainly rely on schema and description
    const debugResult = await debugInconsistency(problemDescription, schemaString);
    console.log("[/api/debug-inconsistency] Received result from LLM debugger wrapper:", debugResult);

    // 3. Return Debug Result
    return NextResponse.json(debugResult);

  } catch (error: any) {
    console.error("[/api/debug-inconsistency] Error processing request:", error);
    return NextResponse.json({ error: "Failed to debug inconsistency", details: error.message }, { status: 500 });
  }
}

