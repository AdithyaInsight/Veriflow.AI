// src/app/playground/page.tsx
"use client";

import React, { useState } from "react";

// Define types for our application
interface DebugResult {
  explanation: string;
  proposedFix: string | null;
}

type Mode = "generate" | "debug";

export default function PlaygroundPage() {
  // State for both workflows
  const [mode, setMode] = useState<Mode>("generate");
  const [prompt, setPrompt] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Workflow 1: SQL Generation states
  const [generatedSql, setGeneratedSql] = useState<string>("");
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  
  // Workflow 2: Debugging states
  const [debugResult, setDebugResult] = useState<DebugResult | null>(null);
  const [isDebugging, setIsDebugging] = useState<boolean>(false);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [showFixConfirmModal, setShowFixConfirmModal] = useState<boolean>(false);

  // Handle mode switching
  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setPrompt("");
    setError(null);
    setGeneratedSql("");
    setQueryResult(null);
    setQueryError(null);
    setDebugResult(null);
    setDebugError(null);
  };

  // Workflow 1: Generate SQL
  const handleGenerateSql = async () => {
    if (!prompt) {
      setError("Please enter a prompt.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedSql("");
    setQueryResult(null);
    setQueryError(null);

    try {
      const response = await fetch("/api/generate-sql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedSql(data.sql);
    } catch (err: any) {
      console.error("Error generating SQL:", err);
      setError(`Failed to generate SQL: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Workflow 1: Run Query (placeholder)
  const handleRunQuery = async () => {
    if (!generatedSql) {
      setQueryError("No SQL query to run.");
      return;
    }
    
    // Check if this is a DDL query that needs confirmation
    if (
      generatedSql.toLowerCase().includes("create") ||
      generatedSql.toLowerCase().includes("alter") ||
      generatedSql.toLowerCase().includes("drop") ||
      generatedSql.toLowerCase().includes("truncate")
    ) {
      setShowConfirmModal(true);
      return;
    }
    
    executeQuery();
  };
  
  // Execute the query after confirmation if needed
  const executeQuery = async () => {
    setShowConfirmModal(false);
    console.log("Running query (placeholder):", generatedSql);
    setIsQuerying(true);
    setQueryError(null);
    setQueryResult(null);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setQueryResult([{ message: "Query execution against lowdb needs a dedicated API endpoint and interpreter." }]);
    setIsQuerying(false);
    // TODO: Implement API call to /api/execute-query
  };

  // Workflow 2: Debug Inconsistency
  const handleDebugInconsistency = async () => {
    if (!prompt) {
      setError("Please enter a problem description.");
      return;
    }
    setIsDebugging(true);
    setError(null);
    setDebugResult(null);
    setDebugError(null);

    try {
      const response = await fetch("/api/debug-inconsistency", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ problemDescription: prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDebugResult(data);
    } catch (err: any) {
      console.error("Error debugging inconsistency:", err);
      setDebugError(`Failed to debug inconsistency: ${err.message}`);
    } finally {
      setIsDebugging(false);
    }
  };

  // Workflow 2: Apply Fix (placeholder)
  const handleApplyFix = async () => {
    if (!debugResult?.proposedFix) {
      setDebugError("No fix available to apply.");
      return;
    }
    
    setShowFixConfirmModal(true);
  };
  
  // Execute the fix after confirmation
  const executeFix = async () => {
    setShowFixConfirmModal(false);
    console.log("Applying fix (placeholder):", debugResult?.proposedFix);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setQueryResult([{ message: "Fix applied successfully (placeholder)." }]);
    // TODO: Implement API call to /api/execute-query with the fix SQL
  };

  return (
    <div className="container mx-auto p-4 flex flex-col h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Veriflow AI Playground</h1>
      
      {/* Mode Selector */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => switchMode("generate")}
          className={`px-4 py-2 rounded-md ${
            mode === "generate"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          SQL Generation
        </button>
        <button
          onClick={() => switchMode("debug")}
          className={`px-4 py-2 rounded-md ${
            mode === "debug"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Debug Inconsistency
        </button>
      </div>

      <div className="flex flex-col space-y-4 flex-grow">
        {/* Prompt Input */}
        <div className="flex-shrink-0">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
            {mode === "generate" 
              ? "Enter your SQL generation request:" 
              : "Describe the data inconsistency issue:"}
          </label>
          <textarea
            id="prompt"
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={mode === "generate" 
              ? "e.g., Create a view for active customers, Show me total transactions per customer..." 
              : "e.g., The count in daily_active_users view is lower than expected compared to the user_logins table..."}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={mode === "generate" ? handleGenerateSql : handleDebugInconsistency}
            disabled={isLoading || isDebugging}
            className={`mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${
              (isLoading || isDebugging) ? "cursor-not-allowed" : ""
            }`}
          >
            {mode === "generate" 
              ? (isLoading ? "Generating..." : "Generate SQL") 
              : (isDebugging ? "Analyzing..." : "Analyze Issue")}
          </button>
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>

        {/* Workflow 1: SQL Generation Results */}
        {mode === "generate" && (
          <>
            <div className="flex-shrink-0">
              <label htmlFor="generated-sql" className="block text-sm font-medium text-gray-700 mb-1">
                Generated SQL:
              </label>
              <textarea
                id="generated-sql"
                readOnly
                rows={8}
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 font-mono text-sm"
                value={generatedSql}
                placeholder="SQL will appear here..."
              />
              <button
                onClick={handleRunQuery}
                disabled={!generatedSql || isQuerying}
                className={`mt-2 px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 ${
                  isQuerying ? "cursor-not-allowed" : ""
                }`}
              >
                {isQuerying ? "Running..." : "Run Query"}
              </button>
              {queryError && <p className="text-red-600 text-sm mt-1">{queryError}</p>}
            </div>

            {/* Query Results */}
            <div className="flex-grow overflow-auto border border-gray-300 rounded-md p-2 bg-white">
              <h2 className="text-lg font-semibold mb-2 text-gray-800">Query Results Preview</h2>
              {isQuerying && <p className="text-gray-500">Loading results...</p>}
              {queryResult ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                      {queryResult.length > 0 && (
                        <tr>
                          {Object.keys(queryResult[0]).map((key) => (
                            <th
                              key={key}
                              scope="col"
                              className="px-4 py-2 text-left font-medium text-gray-600 uppercase tracking-wider"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      )}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {queryResult.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2 whitespace-nowrap">
                              {typeof value === "object" ? JSON.stringify(value) : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {queryResult.length === 0 && !isQuerying && (
                    <p className="text-gray-500 p-2">No results to display.</p>
                  )}
                </div>
              ) : (
                !isQuerying && <p className="text-gray-500 p-2">Results will appear here after running a query.</p>
              )}
            </div>
          </>
        )}

        {/* Workflow 2: Debug Results */}
        {mode === "debug" && (
          <>
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Analysis Results:
              </label>
              <div className="border border-gray-300 rounded-md p-4 bg-white">
                {debugResult ? (
                  <>
                    <h3 className="font-semibold text-lg mb-2">Explanation</h3>
                    <p className="mb-4 text-gray-700">{debugResult.explanation}</p>
                    
                    {debugResult.proposedFix && (
                      <>
                        <h3 className="font-semibold text-lg mb-2">Proposed Fix</h3>
                        <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-sm font-mono mb-4">
                          {debugResult.proposedFix}
                        </pre>
                        <button
                          onClick={handleApplyFix}
                          className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Apply Fix
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">
                    {isDebugging ? "Analyzing issue..." : "Analysis results will appear here."}
                  </p>
                )}
                {debugError && <p className="text-red-600 text-sm mt-2">{debugError}</p>}
              </div>
            </div>

            {/* Fix Preview Results */}
            {queryResult && (
              <div className="flex-grow overflow-auto border border-gray-300 rounded-md p-2 bg-white">
                <h2 className="text-lg font-semibold mb-2 text-gray-800">Fix Results</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                      {queryResult.length > 0 && (
                        <tr>
                          {Object.keys(queryResult[0]).map((key) => (
                            <th
                              key={key}
                              scope="col"
                              className="px-4 py-2 text-left font-medium text-gray-600 uppercase tracking-wider"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      )}
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {queryResult.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-2 whitespace-nowrap">
                              {typeof value === "object" ? JSON.stringify(value) : String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal for SQL Execution */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h3 className="text-lg font-bold mb-4">Confirm SQL Execution</h3>
            <p className="mb-4">
              You are about to execute a DDL statement that may modify the database structure. Are you sure you want to proceed?
            </p>
            <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-sm font-mono mb-4">
              {generatedSql}
            </pre>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={executeQuery}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Fix Application */}
      {showFixConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Fix Application</h3>
            <p className="mb-4">
              You are about to apply the proposed fix. This will modify the database. Are you sure you want to proceed?
            </p>
            <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto text-sm font-mono mb-4">
              {debugResult?.proposedFix}
            </pre>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowFixConfirmModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={executeFix}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Apply Fix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
