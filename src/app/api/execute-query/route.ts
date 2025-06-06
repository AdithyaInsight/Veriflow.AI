import { NextResponse } from "next/server";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import path from "path";

interface Customer {
  CustomerID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  SignupDate: string;
}

interface Transaction {
  TransactionID: number;
  CustomerID: number;
  Product: string;
  Amount: number;
  TransactionDate: string;
}

interface DbSchema {
  Customers: Customer[];
  Transactions: Transaction[];
  Views?: { [viewName: string]: any }; // Store created views
}

// Initialize LowDB
const dbFilePath = path.join(process.cwd(), "db", "SalesDB.json");
const adapter = new JSONFile<DbSchema>(dbFilePath);
const db = new Low<DbSchema>(adapter, { Customers: [], Transactions: [], Views: {} });

export async function POST(request: Request) {
  console.log("🔍 === API ROUTE: /api/execute-query START ===");
  
  try {
    const { sql } = await request.json();

    if (!sql || typeof sql !== "string") {
      console.error("❌ Invalid SQL provided:", sql);
      return NextResponse.json({ error: "Invalid SQL provided" }, { status: 400 });
    }

    console.log("📝 [EXEC] Received SQL:", sql);
    console.log("📝 [EXEC] SQL length:", sql.length);

    // Read current data
    await db.read();
    console.log("📊 [EXEC] Database loaded");

    // Parse and execute the SQL
    const result = await executeSQL(sql, db);
    
    console.log("✅ [EXEC] Query executed successfully");
    console.log("📊 [EXEC] Result rows:", Array.isArray(result.data) ? result.data.length : 1);
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("🔥 === EXECUTE QUERY ERROR ===");
    console.error("❌ [EXEC] Error:", error.message);
    console.error("❌ [EXEC] Stack:", error.stack);
    console.error("🔥 === EXECUTE QUERY ERROR END ===");
    
    return NextResponse.json({ 
      error: "Failed to execute query", 
      details: error.message,
      data: []
    }, { status: 500 });
  }
}

// New endpoint to get existing view definitions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const viewName = searchParams.get('view');
    
    await db.read();
    
    if (viewName) {
      // Get specific view definition
      const view = db.data.Views?.[viewName];
      if (view) {
        return NextResponse.json({ 
          viewName, 
          definition: view.definition,
          created_at: view.created_at 
        });
      } else {
        return NextResponse.json({ error: "View not found" }, { status: 404 });
      }
    } else {
      // Get all views
      return NextResponse.json({ 
        views: Object.keys(db.data.Views || {}),
        allViews: db.data.Views || {}
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function executeSQL(sql: string, db: Low<DbSchema>): Promise<{ data: any[]; message: string }> {
  const trimmedSQL = sql.trim().toLowerCase();
  
  console.log("🔍 [EXEC] Parsing SQL type...");
  
  // Handle CREATE VIEW statements
  if (trimmedSQL.startsWith('create view') || trimmedSQL.startsWith('create or replace view')) {
    return await handleCreateView(sql, db);
  }
  
  // Handle SELECT statements
  if (trimmedSQL.startsWith('select')) {
    return await handleSelect(sql, db);
  }
  
  // Handle CREATE TABLE statements
  if (trimmedSQL.startsWith('create table')) {
    return await handleCreateTable(sql, db);
  }
  
  // Handle INSERT statements
  if (trimmedSQL.startsWith('insert')) {
    return await handleInsert(sql, db);
  }
  
  // Default case - just show the SQL was received
  return {
    data: [{ 
      message: "SQL parsed successfully", 
      sql_type: "Other", 
      sql_preview: sql.substring(0, 100) + "..." 
    }],
    message: "SQL command processed (simulation)"
  };
}

async function handleCreateView(sql: string, db: Low<DbSchema>): Promise<{ data: any[]; message: string }> {
  console.log("🔧 [EXEC] Handling CREATE VIEW...");
  
  // Handle both CREATE VIEW and CREATE OR REPLACE VIEW
  // Use multiline matching without the 's' flag
  const normalizedSql = sql.replace(/\n/g, ' ').replace(/\s+/g, ' ');
  const viewRegex = /create\s+(?:or\s+replace\s+)?view\s+(\w+)\s+as\s+(select\s+.+)/i;
  const match = normalizedSql.match(viewRegex);
  
  if (!match) {
    throw new Error("Invalid CREATE VIEW syntax");
  }
  
  const viewName = match[1];
  const selectQuery = match[2];
  
  console.log("📝 [EXEC] View name:", viewName);
  console.log("📝 [EXEC] Select query:", selectQuery);
  
  // Execute the SELECT part to get the view data
  const selectResult = await handleSelect(selectQuery, db);
  
  // Store the view definition and data
  if (!db.data.Views) {
    db.data.Views = {};
  }
  
  const isReplace = sql.toLowerCase().includes('or replace');
  const existingView = db.data.Views[viewName];
  
  db.data.Views[viewName] = {
    definition: sql,
    data: selectResult.data,
    created_at: new Date().toISOString(),
    updated_at: isReplace ? new Date().toISOString() : existingView?.created_at,
    previous_definition: isReplace ? existingView?.definition : null
  };
  
  // Save to file
  await db.write();
  
  return {
    data: [{ 
      view_name: viewName, 
      rows_created: selectResult.data.length,
      message: `View '${viewName}' ${isReplace ? 'updated' : 'created'} successfully with ${selectResult.data.length} rows`,
      action: isReplace ? 'replaced' : 'created'
    }],
    message: `CREATE VIEW executed successfully`
  };
}

async function handleSelect(sql: string, db: Low<DbSchema>): Promise<{ data: any[]; message: string }> {
  console.log("🔍 [EXEC] Handling SELECT...");
  
  const lowerSQL = sql.toLowerCase();
  
  // Simple patterns for common queries
  if (lowerSQL.includes('from customers') && lowerSQL.includes('from transactions')) {
    // JOIN query between customers and transactions
    return handleJoinQuery(sql, db);
  } else if (lowerSQL.includes('from customers')) {
    // Customers table query
    return handleCustomersQuery(sql, db);
  } else if (lowerSQL.includes('from transactions')) {
    // Transactions table query
    return handleTransactionsQuery(sql, db);
  } else {
    // Check if it's querying a view
    const viewMatch = lowerSQL.match(/from\s+(\w+)/);
    if (viewMatch && db.data.Views && db.data.Views[viewMatch[1]]) {
      return {
        data: db.data.Views[viewMatch[1]].data || [],
        message: `Selected from view '${viewMatch[1]}'`
      };
    }
  }
  
  // Fallback: return sample data
  return {
    data: [{ message: "SELECT query processed", sql_preview: sql.substring(0, 100) }],
    message: "SELECT executed (simplified)"
  };
}

async function handleJoinQuery(sql: string, db: Low<DbSchema>): Promise<{ data: any[]; message: string }> {
  console.log("🔗 [EXEC] Handling JOIN query...");
  
  // Simple JOIN implementation: customers with their transactions
  const result = db.data.Customers.map(customer => {
    const customerTransactions = db.data.Transactions.filter(t => t.CustomerID === customer.CustomerID);
    const totalAmount = customerTransactions.reduce((sum, t) => sum + t.Amount, 0);
    const transactionCount = customerTransactions.length;
    
    return {
      CustomerID: customer.CustomerID,
      FirstName: customer.FirstName,
      LastName: customer.LastName,
      Email: customer.Email,
      SignupDate: customer.SignupDate,
      TotalAmount: totalAmount,
      TransactionCount: transactionCount,
      // Check if customer is "active" (has transactions)
      IsActive: transactionCount > 0
    };
  });
  
  // Filter for active customers if the query mentions "active"
  const filteredResult = sql.toLowerCase().includes('active') 
    ? result.filter(r => r.IsActive)
    : result;
  
  return {
    data: filteredResult,
    message: `JOIN query executed, ${filteredResult.length} rows returned`
  };
}

async function handleCustomersQuery(sql: string, db: Low<DbSchema>): Promise<{ data: any[]; message: string }> {
  console.log("👥 [EXEC] Handling Customers query...");
  
  let result = [...db.data.Customers];
  
  // Simple WHERE clause handling
  if (sql.toLowerCase().includes('where')) {
    console.log("🔍 [EXEC] WHERE clause detected (simplified handling)");
  }
  
  // Limit results for display
  if (result.length > 50) {
    result = result.slice(0, 50);
  }
  
  return {
    data: result,
    message: `Customers query executed, ${result.length} rows returned`
  };
}

async function handleTransactionsQuery(sql: string, db: Low<DbSchema>): Promise<{ data: any[]; message: string }> {
  console.log("💳 [EXEC] Handling Transactions query...");
  
  let result = [...db.data.Transactions];
  
  // Limit results for display
  if (result.length > 50) {
    result = result.slice(0, 50);
  }
  
  return {
    data: result,
    message: `Transactions query executed, ${result.length} rows returned`
  };
}

async function handleCreateTable(sql: string, db: Low<DbSchema>): Promise<{ data: any[]; message: string }> {
  console.log("🔧 [EXEC] Handling CREATE TABLE...");
  
  return {
    data: [{ message: "CREATE TABLE simulation", note: "In LowDB, tables are created dynamically" }],
    message: "CREATE TABLE executed (simulation)"
  };
}

async function handleInsert(sql: string, db: Low<DbSchema>): Promise<{ data: any[]; message: string }> {
  console.log("➕ [EXEC] Handling INSERT...");
  
  return {
    data: [{ message: "INSERT simulation", note: "Data would be added to LowDB" }],
    message: "INSERT executed (simulation)"
  };
} 