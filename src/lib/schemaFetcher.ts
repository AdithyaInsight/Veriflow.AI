// src/lib/schemaFetcher.ts
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";

interface SchemaInfo {
  TABLE_NAME: string;
  COLUMN_NAME: string;
  DATA_TYPE: string; // Infer type (e.g., 'NUMBER', 'STRING', 'BOOLEAN', 'OBJECT', 'DATETIME')
}

// Define a more flexible schema type for lowdb
interface DbSchema {
  [tableName: string]: Record<string, any>[]; // Assuming tables are arrays of objects
}

// Configure the adapter
const dbFilePath = path.join(process.cwd(), "db", "SalesDB.json");
const adapter = new JSONFile<DbSchema>(dbFilePath);
// Initialize with an empty object as default data, actual data loaded by read()
const db = new Low<DbSchema>(adapter, {});

export async function getSchemaInfo(): Promise<SchemaInfo[]> {
  try {
    await db.read(); // Read the latest data from the file
  } catch (error: any) {
    // Handle case where the file might not exist yet or is invalid JSON
    if (error.code === "ENOENT") {
      console.warn(`Database file not found at ${dbFilePath}. Returning empty schema.`);
      return [];
    } else {
      console.error(`Error reading database file ${dbFilePath}:`, error);
      throw new Error(`Failed to read database schema: ${error.message}`);
    }
  }

  const schemaInfo: SchemaInfo[] = [];
  const data = db.data;

  if (!data || typeof data !== "object") {
    console.warn("Database file is empty or has invalid format. Returning empty schema.");
    return [];
  }

  for (const tableName in data) {
    // Ensure it's a property of the object itself, not from the prototype chain
    if (Object.prototype.hasOwnProperty.call(data, tableName)) {
      const tableData = data[tableName];

      // Check if it's an array (representing a table) and has at least one record
      if (Array.isArray(tableData) && tableData.length > 0) {
        const firstRecord = tableData[0];

        // Iterate through columns of the first record to infer schema
        for (const columnName in firstRecord) {
          if (Object.prototype.hasOwnProperty.call(firstRecord, columnName)) {
            const value = firstRecord[columnName];
            let dataType = typeof value;

            // Basic type inference mimicking SQL types
            if (dataType === "number") {
              dataType = Number.isInteger(value) ? "INTEGER" : "REAL";
            } else if (dataType === "string") {
              // Attempt to detect ISO date strings commonly used
              if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
                dataType = "DATETIME";
              } else {
                dataType = "TEXT";
              }
            } else if (dataType === "boolean") {
              dataType = "BOOLEAN";
            } else if (dataType === "object") {
              if (value === null) {
                dataType = "NULL"; // Or handle as needed, maybe TEXT?
              } else if (Array.isArray(value)) {
                dataType = "ARRAY"; // Represent arrays if needed
              } else {
                dataType = "OBJECT"; // Generic object type
              }
            } else {
              dataType = dataType.toUpperCase(); // Default to uppercase type name
            }

            schemaInfo.push({
              TABLE_NAME: tableName,
              COLUMN_NAME: columnName,
              DATA_TYPE: dataType,
            });
          }
        }
      } else if (Array.isArray(tableData) && tableData.length === 0) {
        // Log if a table exists but is empty
        console.warn(`Table "${tableName}" is empty, cannot infer schema from data.`);
        // Optionally, define a default structure or handle this case as needed
      }
    }
  }

  return schemaInfo;
}

// // Example usage (uncomment to test directly)
// async function testSchemaFetcher() {
//   try {
//     console.log("Fetching schema info...");
//     const info = await getSchemaInfo();
//     console.log("Fetched Schema Info:");
//     console.table(info);
//   } catch (err) {
//     console.error("Error testing schema fetcher:", err);
//   }
// }
// testSchemaFetcher();

