import * as sqlite3 from 'sqlite3';

const dbFilePath = './db/SalesDB.sqlite';

// Use verbose mode for more detailed logs during initialization
const verboseSqlite3 = sqlite3.verbose();

// Connect to the database (creates the file if it doesn't exist)
const db = new verboseSqlite3.Database(dbFilePath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    createTables();
  }
});

function createTables() {
  db.serialize(() => {
    console.log('Starting table creation...');
    // Create Customers table
    db.run(`CREATE TABLE IF NOT EXISTS Customers (
      CustomerID INTEGER PRIMARY KEY AUTOINCREMENT,
      FirstName TEXT NOT NULL,
      LastName TEXT NOT NULL,
      Email TEXT UNIQUE,
      SignupDate DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating Customers table', err.message);
      } else {
        console.log('Customers table created or already exists.');
        insertDummyCustomers(); // Chain insertion after table creation
      }
    });

    // Create Transactions table
    db.run(`CREATE TABLE IF NOT EXISTS Transactions (
      TransactionID INTEGER PRIMARY KEY AUTOINCREMENT,
      CustomerID INTEGER,
      Product TEXT NOT NULL,
      Amount REAL NOT NULL,
      TransactionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (CustomerID) REFERENCES Customers (CustomerID)
    )`, (err) => {
      if (err) {
        console.error('Error creating Transactions table', err.message);
      } else {
        console.log('Transactions table created or already exists.');
        insertDummyTransactions(); // Chain insertion after table creation
      }
    });
    console.log('Table creation commands issued.');
  });
}

let customersInserted = false;
let transactionsInserted = false;

function checkAndCloseDb() {
    if (customersInserted && transactionsInserted) {
        console.log('All insertions finalized, closing DB connection.');
        db.close((err) => {
            if (err) {
                console.error('Error closing database', err.message);
            } else {
                console.log('Database connection closed successfully.');
            }
        });
    }
}

function insertDummyCustomers() {
  const customers = [
    { fname: 'Alice', lname: 'Smith', email: 'alice.smith@example.com' },
    { fname: 'Bob', lname: 'Johnson', email: 'bob.j@example.com' },
    { fname: 'Charlie', lname: 'Brown', email: 'charlie.b@example.com' },
    { fname: 'Diana', lname: 'Davis', email: 'diana.davis@sample.net' },
  ];

  const stmt = db.prepare("INSERT INTO Customers (FirstName, LastName, Email) VALUES (?, ?, ?)");
  console.log('Inserting dummy customers...');
  let completedCount = 0;
  customers.forEach(cust => {
    stmt.run(cust.fname, cust.lname, cust.email, function(err) { // Use function() to access this.lastID
        completedCount++;
        if (err && err.message.includes('UNIQUE constraint failed')) {
            // console.log(`Customer ${cust.email} already exists.`);
        } else if (err) {
            console.error('Error inserting customer:', err.message);
        } else {
            // console.log(`Inserted customer with ID: ${this.lastID}`);
        }
        if (completedCount === customers.length) {
            stmt.finalize((finalizeErr) => {
                if(finalizeErr) console.error('Error finalizing customer insert statement:', finalizeErr.message);
                else console.log('Dummy customers insertion finalized.');
                customersInserted = true;
                checkAndCloseDb();
            });
        }
    });
  });
}

function insertDummyTransactions() {
  const transactions = [
    { custId: 1, product: 'Laptop', amount: 1200.50 },
    { custId: 2, product: 'Keyboard', amount: 75.00 },
    { custId: 1, product: 'Mouse', amount: 25.99 },
    { custId: 3, product: 'Monitor', amount: 300.00 },
    { custId: 4, product: 'Webcam', amount: 55.50 },
    { custId: 2, product: 'Docking Station', amount: 150.75 },
  ];

  const stmt = db.prepare("INSERT INTO Transactions (CustomerID, Product, Amount) VALUES (?, ?, ?)");
  console.log('Inserting dummy transactions...');
  let completedCount = 0;
  transactions.forEach(tx => {
    stmt.run(tx.custId, tx.product, tx.amount, function(err) { // Use function() to access this.lastID
        completedCount++;
        if (err) {
            console.error('Error inserting transaction:', err.message);
        } else {
            // console.log(`Inserted transaction with ID: ${this.lastID}`);
        }
        if (completedCount === transactions.length) {
            stmt.finalize((finalizeErr) => {
                if(finalizeErr) console.error('Error finalizing transaction insert statement:', finalizeErr.message);
                else console.log('Dummy transactions insertion finalized.');
                transactionsInserted = true;
                checkAndCloseDb();
            });
        }
    });
  });
}

// Added error handling for process exit
process.on('exit', (code) => {
  console.log(`Script finished with code ${code}`);
  // Ensure DB is closed if script exits unexpectedly
  // Removed the check for db.open as it's not a valid property
  if (db) {
      try {
          db.close();
          console.log('Attempted DB close on exit.');
      } catch (closeErr: any) {
          // Ignore errors if DB is already closed
          if (!closeErr.message.includes('Database is closed')) {
              console.error('Error closing DB on exit:', closeErr.message);
          }
      }
  }
});

