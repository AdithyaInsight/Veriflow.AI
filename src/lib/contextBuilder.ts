// src/lib/contextBuilder.ts

interface SchemaInfo {
  TABLE_NAME: string;
  COLUMN_NAME: string;
  DATA_TYPE: string;
}

/**
 * Builds a context string for the LLM by combining the user prompt
 * and the database schema information.
 * 
 * @param prompt The user's natural language prompt.
 * @param schema An array of schema information objects.
 * @returns A formatted string containing the prompt and schema for the LLM.
 */
export function buildContext(prompt: string, schema: SchemaInfo[]): string {
  let schemaString = "Database Schema:\n";

  // Group columns by table
  const tables: { [tableName: string]: { COLUMN_NAME: string; DATA_TYPE: string }[] } = {};
  schema.forEach(col => {
    if (!tables[col.TABLE_NAME]) {
      tables[col.TABLE_NAME] = [];
    }
    tables[col.TABLE_NAME].push({ COLUMN_NAME: col.COLUMN_NAME, DATA_TYPE: col.DATA_TYPE });
  });

  // Format the schema string
  for (const tableName in tables) {
    schemaString += `Table: ${tableName}\n`;
    tables[tableName].forEach(col => {
      schemaString += `  - ${col.COLUMN_NAME} (${col.DATA_TYPE})\n`;
    });
    schemaString += "\n";
  }

  // Combine prompt and schema
  const context = `User Prompt: ${prompt}\n\n${schemaString}Based on the user prompt and the database schema, generate the appropriate SQL query.
SQL Query:`;

  return context;
}

