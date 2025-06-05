"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lowdb_1 = require("lowdb");
var node_1 = require("lowdb/node");
var path_1 = __importDefault(require("path"));
// Configure the adapter
var dbDirectory = path_1.default.join(process.cwd(), 'db');
var dbFilePath = path_1.default.join(dbDirectory, 'SalesDB.json');
var adapter = new node_1.JSONFile(dbFilePath);
// Default data structure
var defaultData = {
    Customers: [],
    Transactions: [],
};
// Initialize the database
var db = new lowdb_1.Low(adapter, defaultData);
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var customers, customerIdCounter_1, transactions, transactionIdCounter_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Initializing LowDB database...');
                    return [4 /*yield*/, db.read()];
                case 1:
                    _a.sent(); // Read data from JSON file if it exists
                    if (!(db.data.Customers.length === 0 && db.data.Transactions.length === 0)) return [3 /*break*/, 3];
                    console.log('Database is empty, populating with dummy data...');
                    customers = [
                        { FirstName: 'Alice', LastName: 'Smith', Email: 'alice.smith@example.com' },
                        { FirstName: 'Bob', LastName: 'Johnson', Email: 'bob.j@example.com' },
                        { FirstName: 'Charlie', LastName: 'Brown', Email: 'charlie.b@example.com' },
                        { FirstName: 'Diana', LastName: 'Davis', Email: 'diana.davis@sample.net' },
                    ];
                    customerIdCounter_1 = 1;
                    customers.forEach(function (cust) {
                        db.data.Customers.push(__assign(__assign({}, cust), { CustomerID: customerIdCounter_1++, SignupDate: new Date().toISOString() }));
                    });
                    console.log('Dummy customers added.');
                    transactions = [
                        { CustomerID: 1, Product: 'Laptop', Amount: 1200.50 },
                        { CustomerID: 2, Product: 'Keyboard', Amount: 75.00 },
                        { CustomerID: 1, Product: 'Mouse', Amount: 25.99 },
                        { CustomerID: 3, Product: 'Monitor', Amount: 300.00 },
                        { CustomerID: 4, Product: 'Webcam', Amount: 55.50 },
                        { CustomerID: 2, Product: 'Docking Station', Amount: 150.75 },
                    ];
                    transactionIdCounter_1 = 1;
                    transactions.forEach(function (tx) {
                        db.data.Transactions.push(__assign(__assign({}, tx), { TransactionID: transactionIdCounter_1++, TransactionDate: new Date().toISOString() }));
                    });
                    console.log('Dummy transactions added.');
                    // Write data to the file
                    return [4 /*yield*/, db.write()];
                case 2:
                    // Write data to the file
                    _a.sent();
                    console.log('Dummy data written to database file:', dbFilePath);
                    return [3 /*break*/, 4];
                case 3:
                    console.log('Database already contains data. Skipping population.');
                    _a.label = 4;
                case 4:
                    console.log('Database initialization complete.');
                    return [2 /*return*/];
            }
        });
    });
}
// Ensure the db directory exists (LowDB doesn't create directories)
var fs_1 = __importDefault(require("fs"));
if (!fs_1.default.existsSync(dbDirectory)) {
    fs_1.default.mkdirSync(dbDirectory, { recursive: true });
    console.log("Created database directory: ".concat(dbDirectory));
}
// Run the initialization
initializeDatabase().catch(function (err) {
    console.error('Error initializing database:', err);
});
