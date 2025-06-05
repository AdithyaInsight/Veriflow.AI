const { Low } = await import("lowdb");
const { JSONFile } = await import("lowdb/node");
const path = await import("path");
const fs = await import("fs");

// Configure the adapter
const dbDirectory = path.join(process.cwd(), "db");
const dbFilePath = path.join(dbDirectory, "SalesDB.json");
const adapter = new JSONFile(dbFilePath);

// Default data structure
const defaultData = {
  Customers: [],
  Transactions: [],
};

// Initialize the database
const db = new Low(adapter, defaultData);

async function initializeDatabase() {
  console.log("Initializing LowDB database using JS script...");

  // Ensure the db directory exists
  if (!fs.existsSync(dbDirectory)){
      fs.mkdirSync(dbDirectory, { recursive: true });
      console.log(`Created database directory: ${dbDirectory}`);
  }

  await db.read(); // Read data from JSON file if it exists

  // Check if data is already populated to avoid duplicates
  if (db.data.Customers.length === 0 && db.data.Transactions.length === 0) {
    console.log("Database is empty, populating with dummy data...");

    // Add dummy customers
    const customers = [
      { FirstName: "Alice", LastName: "Smith", Email: "alice.smith@example.com" },
      { FirstName: "Bob", LastName: "Johnson", Email: "bob.j@example.com" },
      { FirstName: "Charlie", LastName: "Brown", Email: "charlie.b@example.com" },
      { FirstName: "Diana", LastName: "Davis", Email: "diana.davis@sample.net" },
    ];

    let customerIdCounter = 1;
    customers.forEach(cust => {
      db.data.Customers.push({
        ...cust,
        CustomerID: customerIdCounter++,
        SignupDate: new Date().toISOString(),
      });
    });
    console.log("Dummy customers added.");

    // Add dummy transactions
    const transactions = [
      { CustomerID: 1, Product: "Laptop", Amount: 1200.50 },
      { CustomerID: 2, Product: "Keyboard", Amount: 75.00 },
      { CustomerID: 1, Product: "Mouse", Amount: 25.99 },
      { CustomerID: 3, Product: "Monitor", Amount: 300.00 },
      { CustomerID: 4, Product: "Webcam", Amount: 55.50 },
      { CustomerID: 2, Product: "Docking Station", Amount: 150.75 },
    ];

    let transactionIdCounter = 1;
    transactions.forEach(tx => {
      db.data.Transactions.push({
        ...tx,
        TransactionID: transactionIdCounter++,
        TransactionDate: new Date().toISOString(),
      });
    });
    console.log("Dummy transactions added.");

    // Write data to the file
    await db.write();
    console.log("Dummy data written to database file:", dbFilePath);

  } else {
    console.log("Database already contains data. Skipping population.");
  }

  console.log("Database initialization complete.");
}

// Run the initialization
initializeDatabase().catch(err => {
  console.error("Error initializing database:", err);
});

