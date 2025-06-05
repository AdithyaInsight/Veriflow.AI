// src/lib/contextBuilder.ts

interface SchemaInfo {
  TABLE_NAME: string;
  COLUMN_NAME: string;
  DATA_TYPE: string;
}

/**
 * Builds a comprehensive context string for the LLM by combining the user prompt
 * and the database schema information with enhanced formatting.
 * 
 * @param prompt The user's natural language prompt.
 * @param schema An array of schema information objects.
 * @returns A formatted string containing the prompt and schema for the LLM.
 */
export function buildContext(prompt: string, schema: SchemaInfo[]): string {
  let schemaString = "Available Database Schema:\n\n";

  // Group columns by table
  const tables: { [tableName: string]: { COLUMN_NAME: string; DATA_TYPE: string }[] } = {};
  schema.forEach(col => {
    if (!tables[col.TABLE_NAME]) {
      tables[col.TABLE_NAME] = [];
    }
    tables[col.TABLE_NAME].push({ COLUMN_NAME: col.COLUMN_NAME, DATA_TYPE: col.DATA_TYPE });
  });

  // Format the schema string with better structure
  for (const tableName in tables) {
    schemaString += `Table: ${tableName}\n`;
    schemaString += `Columns:\n`;
    tables[tableName].forEach(col => {
      schemaString += `  - ${col.COLUMN_NAME} (${col.DATA_TYPE})\n`;
    });
    schemaString += "\n";
  }

  // Add relationship hints if we can infer them
  const relationshipHints = inferRelationships(schema);
  if (relationshipHints.length > 0) {
    schemaString += "Likely Relationships:\n";
    relationshipHints.forEach(hint => {
      schemaString += `  - ${hint}\n`;
    });
    schemaString += "\n";
  }

  // Build comprehensive context
  const context = `User Request: "${prompt}"

${schemaString}

Instructions:
- Generate SQL that is compatible with the provided schema
- Use proper SQL syntax and naming conventions
- Consider data types when performing operations
- Include appropriate JOIN conditions if multiple tables are involved
- Add helpful comments where necessary
- Ensure the SQL is executable and follows best practices

Please generate the appropriate SQL query:`;

  return context;
}

/**
 * Attempts to infer relationships between tables based on column names.
 * This is a simple heuristic that looks for common foreign key patterns.
 * 
 * @param schema The database schema information
 * @returns Array of relationship hints
 */
function inferRelationships(schema: SchemaInfo[]): string[] {
  const relationships: string[] = [];
  const tableColumns: { [table: string]: string[] } = {};
  
  // Group columns by table
  schema.forEach(col => {
    if (!tableColumns[col.TABLE_NAME]) {
      tableColumns[col.TABLE_NAME] = [];
    }
    tableColumns[col.TABLE_NAME].push(col.COLUMN_NAME);
  });

  // Look for foreign key patterns (simple heuristic)
  const tables = Object.keys(tableColumns);
  tables.forEach(table => {
    const columns = tableColumns[table];
    columns.forEach(column => {
      // Check if this column name appears as a primary key in another table
      if (column.endsWith('ID') || column.endsWith('Id')) {
        const possibleParentTable = column.replace(/ID$/i, '').replace(/Id$/i, '');
        const possibleParentTablePlural = possibleParentTable + 's';
        
        // Check if we have a table that matches this pattern
        if (tables.includes(possibleParentTablePlural) && table !== possibleParentTablePlural) {
          relationships.push(`${table}.${column} likely references ${possibleParentTablePlural}.${column}`);
        } else if (tables.includes(possibleParentTable) && table !== possibleParentTable) {
          relationships.push(`${table}.${column} likely references ${possibleParentTable}.${column}`);
        }
      }
    });
  });

  return relationships;
}

/**
 * Builds context specifically for debugging inconsistencies with additional structure.
 * 
 * @param problemDescription The user's description of the data inconsistency
 * @param schema The database schema information
 * @param additionalContext Any additional context like view definitions or sample data
 * @returns A formatted context string for debugging
 */
export function buildDebugContext(
  problemDescription: string, 
  schema: SchemaInfo[], 
  additionalContext?: string
): string {
  const schemaContext = buildContext("", schema);
  
  const debugContext = `Data Inconsistency Report:
Problem: "${problemDescription}"

${schemaContext}

${additionalContext ? `Additional Context:\n${additionalContext}\n\n` : ''}

Analysis Requirements:
- Identify the most likely causes of the data discrepancy
- Consider common issues like filtering differences, join conditions, aggregation problems
- Look for timing issues, data type mismatches, or missing data
- Provide actionable insights and specific SQL fixes when possible
- Focus on the relationship between the mentioned database objects

Please analyze this inconsistency and provide your findings.`;

  return debugContext;
}

