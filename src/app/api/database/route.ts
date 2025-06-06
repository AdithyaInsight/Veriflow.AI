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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    const format = searchParams.get('format') || 'json';
    
    await db.read();
    
    if (table) {
      // Get specific table data
      if (table.toLowerCase() === 'customers') {
        return NextResponse.json({ 
          table: 'Customers',
          count: db.data.Customers?.length || 0,
          data: db.data.Customers || [] 
        });
      } else if (table.toLowerCase() === 'transactions') {
        return NextResponse.json({ 
          table: 'Transactions',
          count: db.data.Transactions?.length || 0,
          data: db.data.Transactions || [] 
        });
      } else if (table.toLowerCase() === 'views') {
        return NextResponse.json({ 
          table: 'Views',
          count: Object.keys(db.data.Views || {}).length,
          data: db.data.Views || {} 
        });
      } else {
        return NextResponse.json({ error: "Table not found" }, { status: 404 });
      }
    } else {
      // Get all database info
      const summary = {
        database_file: dbFilePath,
        tables: {
          Customers: {
            count: db.data.Customers?.length || 0,
            sample: db.data.Customers?.slice(0, 2) || []
          },
          Transactions: {
            count: db.data.Transactions?.length || 0,
            sample: db.data.Transactions?.slice(0, 2) || []
          },
          Views: {
            count: Object.keys(db.data.Views || {}).length,
            list: Object.keys(db.data.Views || {})
          }
        },
        schema: {
          Customers: db.data.Customers?.[0] ? Object.keys(db.data.Customers[0]) : [],
          Transactions: db.data.Transactions?.[0] ? Object.keys(db.data.Transactions[0]) : []
        }
      };
      
      if (format === 'html') {
        // Return HTML for easy viewing in browser
        const html = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>LowDB Database Viewer</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .table { border-collapse: collapse; width: 100%; margin: 20px 0; }
              .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .table th { background-color: #f2f2f2; }
              .section { margin: 30px 0; }
              .json { background-color: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
              pre { white-space: pre-wrap; }
            </style>
          </head>
          <body>
            <h1>LowDB Database Viewer</h1>
            <p><strong>Database File:</strong> ${dbFilePath}</p>
            
            <div class="section">
              <h2>Database Summary</h2>
              <div class="json">
                <pre>${JSON.stringify(summary, null, 2)}</pre>
              </div>
            </div>
            
            <div class="section">
              <h2>Customers Table (${db.data.Customers?.length || 0} rows)</h2>
              ${generateTableHTML(db.data.Customers || [], ['CustomerID', 'FirstName', 'LastName', 'Email', 'SignupDate'])}
            </div>
            
            <div class="section">
              <h2>Transactions Table (${db.data.Transactions?.length || 0} rows)</h2>
              ${generateTableHTML(db.data.Transactions || [], ['TransactionID', 'CustomerID', 'Product', 'Amount', 'TransactionDate'])}
            </div>
            
            ${Object.keys(db.data.Views || {}).length > 0 ? `
            <div class="section">
              <h2>Views (${Object.keys(db.data.Views || {}).length})</h2>
              ${Object.entries(db.data.Views || {}).map(([name, view]) => `
                <h3>View: ${name}</h3>
                <div class="json">
                  <pre>${view.definition}</pre>
                </div>
                <p><strong>Rows:</strong> ${view.data?.length || 0}</p>
              `).join('')}
            </div>
            ` : ''}
            
            <div class="section">
              <h2>API Usage</h2>
              <ul>
                <li><a href="/api/database">Full database summary (JSON)</a></li>
                <li><a href="/api/database?table=customers">Customers table</a></li>
                <li><a href="/api/database?table=transactions">Transactions table</a></li>
                <li><a href="/api/database?table=views">Views</a></li>
                <li><a href="/api/database?format=html">This HTML view</a></li>
              </ul>
            </div>
          </body>
          </html>
        `;
        
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html',
          },
        });
      }
      
      return NextResponse.json(summary);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateTableHTML(data: any[], columns: string[]): string {
  if (!data || data.length === 0) {
    return '<p>No data available</p>';
  }
  
  let html = '<table class="table"><thead><tr>';
  columns.forEach(col => {
    html += `<th>${col}</th>`;
  });
  html += '</tr></thead><tbody>';
  
  data.forEach(row => {
    html += '<tr>';
    columns.forEach(col => {
      html += `<td>${row[col] || ''}</td>`;
    });
    html += '</tr>';
  });
  
  html += '</tbody></table>';
  return html;
} 