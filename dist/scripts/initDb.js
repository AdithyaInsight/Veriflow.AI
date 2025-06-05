"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var sqlite3 = __importStar(require("sqlite3"));
var dbFilePath = './db/SalesDB.sqlite';
// Use verbose mode for more detailed logs during initialization
var verboseSqlite3 = sqlite3.verbose();
// Connect to the database (creates the file if it doesn't exist)
var db = new verboseSqlite3.Database(dbFilePath, function (err) {
    if (err) {
        console.error('Error opening database', err.message);
    }
    else {
        console.log('Connected to the SQLite database.');
        createTables();
    }
});
function createTables() {
    db.serialize(function () {
        console.log('Starting table creation...');
        // Create Customers table
        db.run("CREATE TABLE IF NOT EXISTS Customers (\n      CustomerID INTEGER PRIMARY KEY AUTOINCREMENT,\n      FirstName TEXT NOT NULL,\n      LastName TEXT NOT NULL,\n      Email TEXT UNIQUE,\n      SignupDate DATETIME DEFAULT CURRENT_TIMESTAMP\n    )", function (err) {
            if (err) {
                console.error('Error creating Customers table', err.message);
            }
            else {
                console.log('Customers table created or already exists.');
                insertDummyCustomers(); // Chain insertion after table creation
            }
        });
        // Create Transactions table
        db.run("CREATE TABLE IF NOT EXISTS Transactions (\n      TransactionID INTEGER PRIMARY KEY AUTOINCREMENT,\n      CustomerID INTEGER,\n      Product TEXT NOT NULL,\n      Amount REAL NOT NULL,\n      TransactionDate DATETIME DEFAULT CURRENT_TIMESTAMP,\n      FOREIGN KEY (CustomerID) REFERENCES Customers (CustomerID)\n    )", function (err) {
            if (err) {
                console.error('Error creating Transactions table', err.message);
            }
            else {
                console.log('Transactions table created or already exists.');
                insertDummyTransactions(); // Chain insertion after table creation
            }
        });
        console.log('Table creation commands issued.');
    });
}
var customersInserted = false;
var transactionsInserted = false;
function checkAndCloseDb() {
    if (customersInserted && transactionsInserted) {
        console.log('All insertions finalized, closing DB connection.');
        db.close(function (err) {
            if (err) {
                console.error('Error closing database', err.message);
            }
            else {
                console.log('Database connection closed successfully.');
            }
        });
    }
}
function insertDummyCustomers() {
    var customers = [
        { fname: 'Alice', lname: 'Smith', email: 'alice.smith@example.com' },
        { fname: 'Bob', lname: 'Johnson', email: 'bob.j@example.com' },
        { fname: 'Charlie', lname: 'Brown', email: 'charlie.b@example.com' },
        { fname: 'Diana', lname: 'Davis', email: 'diana.davis@sample.net' },
    ];
    var stmt = db.prepare("INSERT INTO Customers (FirstName, LastName, Email) VALUES (?, ?, ?)");
    console.log('Inserting dummy customers...');
    var completedCount = 0;
    customers.forEach(function (cust) {
        stmt.run(cust.fname, cust.lname, cust.email, function (err) {
            completedCount++;
            if (err && err.message.includes('UNIQUE constraint failed')) {
                // console.log(`Customer ${cust.email} already exists.`);
            }
            else if (err) {
                console.error('Error inserting customer:', err.message);
            }
            else {
                // console.log(`Inserted customer with ID: ${this.lastID}`);
            }
            if (completedCount === customers.length) {
                stmt.finalize(function (finalizeErr) {
                    if (finalizeErr)
                        console.error('Error finalizing customer insert statement:', finalizeErr.message);
                    else
                        console.log('Dummy customers insertion finalized.');
                    customersInserted = true;
                    checkAndCloseDb();
                });
            }
        });
    });
}
function insertDummyTransactions() {
    var transactions = [
        { custId: 1, product: 'Laptop', amount: 1200.50 },
        { custId: 2, product: 'Keyboard', amount: 75.00 },
        { custId: 1, product: 'Mouse', amount: 25.99 },
        { custId: 3, product: 'Monitor', amount: 300.00 },
        { custId: 4, product: 'Webcam', amount: 55.50 },
        { custId: 2, product: 'Docking Station', amount: 150.75 },
    ];
    var stmt = db.prepare("INSERT INTO Transactions (CustomerID, Product, Amount) VALUES (?, ?, ?)");
    console.log('Inserting dummy transactions...');
    var completedCount = 0;
    transactions.forEach(function (tx) {
        stmt.run(tx.custId, tx.product, tx.amount, function (err) {
            completedCount++;
            if (err) {
                console.error('Error inserting transaction:', err.message);
            }
            else {
                // console.log(`Inserted transaction with ID: ${this.lastID}`);
            }
            if (completedCount === transactions.length) {
                stmt.finalize(function (finalizeErr) {
                    if (finalizeErr)
                        console.error('Error finalizing transaction insert statement:', finalizeErr.message);
                    else
                        console.log('Dummy transactions insertion finalized.');
                    transactionsInserted = true;
                    checkAndCloseDb();
                });
            }
        });
    });
}
// Added error handling for process exit
process.on('exit', function (code) {
    console.log("Script finished with code ".concat(code));
    // Ensure DB is closed if script exits unexpectedly
    // Removed the check for db.open as it's not a valid property
    if (db) {
        try {
            db.close();
            console.log('Attempted DB close on exit.');
        }
        catch (closeErr) {
            // Ignore errors if DB is already closed
            if (!closeErr.message.includes('Database is closed')) {
                console.error('Error closing DB on exit:', closeErr.message);
            }
        }
    }
});
