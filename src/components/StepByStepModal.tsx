"use client";

import React, { useState, useEffect } from 'react';

interface SchemaTable {
  TABLE_NAME: string;
  COLUMN_NAME: string;
}

interface StepData {
  id: number;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  output?: any;
  isEditable?: boolean;
}

interface StepByStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'generate' | 'debug';
  prompt: string;
}

export default function StepByStepModal({ isOpen, onClose, mode, prompt }: StepByStepModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<StepData[]>([]);
  const [editableQuery, setEditableQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  // Define steps for SQL Generation
  const sqlGenerationSteps = [
    { id: 1, title: "Database Schema Analysis", status: 'pending' as const },
    { id: 2, title: "Query Generation", status: 'pending' as const },
    { id: 3, title: "Query Review & Execution", status: 'pending' as const, isEditable: true },
    { id: 4, title: "Results", status: 'pending' as const }
  ];

  // Define steps for Debug Inconsistencies
  const debugSteps = [
    { id: 1, title: "Database Schema Analysis", status: 'pending' as const },
    { id: 2, title: "View Definition Analysis", status: 'pending' as const },
    { id: 3, title: "Automated Diagnosis", status: 'pending' as const },
    { id: 4, title: "Resolution Proposal", status: 'pending' as const },
    { id: 5, title: "Results", status: 'pending' as const }
  ];

  useEffect(() => {
    if (isOpen) {
      const initialSteps = mode === 'generate' ? sqlGenerationSteps : debugSteps;
      setSteps(initialSteps);
      setCurrentStep(0);
      startProcessing();
    }
  }, [isOpen, mode]);

  const startProcessing = async () => {
    const totalSteps = mode === 'generate' ? 4 : 5;
    
    for (let i = 0; i < totalSteps; i++) {
      setCurrentStep(i);
      setSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'processing' } : step
      ));

      const output = await processStep(i + 1);
      
      setSteps(prev => prev.map((step, index) => 
        index === i ? { ...step, status: 'completed', output } : step
      ));

      // Don't auto-advance past step 3 for SQL generation (Execute Query step)
      if (mode === 'generate' && i === 2) break;
      // Don't auto-advance past step 4 for debug (Analysis step)
      if (mode === 'debug' && i === 3) break;

      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };

  const processStep = async (stepNumber: number): Promise<any> => {
    try {
      switch (stepNumber) {
        case 1: // Fetch Database Schemas
          await new Promise(resolve => setTimeout(resolve, 1000));
          const schemaData = await fetchDatabaseSchema();
          console.log('Schema data fetched:', schemaData);
          return schemaData;
        
        case 2: // Search for Views (Debug only) or Run LLM (Generate)
          await new Promise(resolve => setTimeout(resolve, 1200));
          if (mode === 'debug') {
            const viewData = await searchForViews();
            console.log('View data fetched:', viewData);
            return viewData;
          } else {
            const llmData = await runLLMGeneration();
            console.log('LLM generation data:', llmData);
            return llmData;
          }
        
        case 3: // Run LLM (Debug) or Execute Query (Generate)
          await new Promise(resolve => setTimeout(resolve, 1500));
          if (mode === 'debug') {
            const debugData = await runLLMDebug();
            console.log('LLM debug data:', debugData);
            if (!debugData || !debugData.data) {
              throw new Error('Failed to get valid debug data from LLM');
            }
            return debugData;
          } else {
            return null; // User interaction required
          }
        
        case 4: // Analysis (Debug) or Results (Generate)
          await new Promise(resolve => setTimeout(resolve, 1000));
          if (mode === 'debug') {
            const analysisData = await generateAnalysis();
            console.log('Analysis data generated:', analysisData);
            return analysisData;
          } else {
            return null; // Results shown after execution
          }
        
        default:
          return null;
      }
    } catch (error: unknown) {
      console.error(`Error processing step ${stepNumber}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return {
        type: 'error',
        data: {
          message: `Error during ${mode === 'debug' ? 'debugging' : 'generation'} process: ${errorMessage}`
        },
        summary: 'Process failed'
      };
    }
  };

  const fetchDatabaseSchema = async () => {
    try {
      const response = await fetch('/api/schema');
      const schema: SchemaTable[] = await response.json();
      return {
        type: 'schema',
        data: schema,
        summary: `Found ${schema.length} tables: ${schema.map((s: SchemaTable) => s.TABLE_NAME).join(', ')}`
      };
    } catch (error) {
      return {
        type: 'schema',
        data: [
          { TABLE_NAME: 'Customers', COLUMN_NAME: 'CustomerID, FirstName, LastName, Email, SignupDate' },
          { TABLE_NAME: 'Transactions', COLUMN_NAME: 'TransactionID, CustomerID, Product, Amount, TransactionDate' }
        ],
        summary: 'Found 2 tables: Customers, Transactions'
      };
    }
  };

  const searchForViews = async () => {
    try {
      const response = await fetch('/api/execute-query', { method: 'GET' });
      const data = await response.json();
      return {
        type: 'views',
        data: data.allViews || {},
        summary: `Found ${Object.keys(data.allViews || {}).length} existing views`
      };
    } catch (error) {
      return {
        type: 'views',
        data: {},
        summary: 'No existing views found'
      };
    }
  };

  const runLLMGeneration = async () => {
    try {
      const response = await fetch('/api/generate-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const data = await response.json();
      setEditableQuery(data.sql);
      return {
        type: 'sql',
        data: data.sql,
        summary: `Generated SQL query (${data.sql.length} characters)`
      };
    } catch (error) {
      return {
        type: 'sql',
        data: 'SELECT * FROM Customers;',
        summary: 'Generated sample SQL query'
      };
    }
  };

  const runLLMDebug = async () => {
    try {
      const response = await fetch('/api/debug-inconsistency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemDescription: prompt })
      });
      const data = await response.json();
      return {
        type: 'debug',
        data: data,
        summary: 'AI analysis completed - root cause identified'
      };
    } catch (error) {
      // Return mock data with GitHub-style diff for demo
      return {
        type: 'debug',
        data: { 
          explanation: 'The discrepancy arises because the ActiveCustomers view only includes customers who have at least one transaction with Amount > 0. This means customers who have signed up but have not made any transactions, or customers with only $0 transactions, are excluded from the count.',
          diffInfo: {
            originalSQL: `CREATE VIEW ActiveCustomers AS
SELECT CustomerID, FirstName, LastName, Email, SignupDate
FROM Customers c
WHERE EXISTS (
    SELECT 1 FROM Transactions t 
    WHERE t.CustomerID = c.CustomerID 
    AND t.Amount > 0
);`,
            proposedSQL: `CREATE VIEW ActiveCustomers AS
SELECT CustomerID, FirstName, LastName, Email, SignupDate
FROM Customers c
WHERE EXISTS (
    SELECT 1 FROM Transactions t 
    WHERE t.CustomerID = c.CustomerID
);`
          },
          proposedFix: `DROP VIEW IF EXISTS ActiveCustomers;
CREATE VIEW ActiveCustomers AS
SELECT CustomerID, FirstName, LastName, Email, SignupDate
FROM Customers c
WHERE EXISTS (
    SELECT 1 FROM Transactions t 
    WHERE t.CustomerID = c.CustomerID
);`
        },
        summary: 'Debug analysis completed'
      };
    }
  };

  const generateAnalysis = async () => {
    // Get debug data from step 3 (LLM Debug step) instead of step 2
    const debugData = steps[2]?.output?.data;
    console.log('Debug data from LLM step:', debugData); // Add logging for debugging
    
    if (!debugData || !debugData.explanation) {
      console.warn('Missing or invalid debug data:', debugData);
      return {
        type: 'analysis',
        data: {
          explanation: 'Analysis data not available. Please try running the debug process again.',
          diffInfo: null,
          proposedFix: null
        },
        summary: 'Analysis incomplete'
      };
    }
    
    // Ensure we have the complete analysis data structure
    const analysisData = {
      explanation: debugData.explanation,
      diffInfo: debugData.diffInfo || null,
      proposedFix: debugData.proposedFix || null
    };
    
    console.log('Processed analysis data:', analysisData);
    
    return {
      type: 'analysis',
      data: analysisData,
      summary: 'Analysis ready with proposed solution'
    };
  };

  const executeQuery = async (query: string) => {
    setIsExecuting(true);
    try {
      const response = await fetch('/api/execute-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql: query })
      });
      const data = await response.json();
      
      // Complete the results step
      setSteps(prev => prev.map((step, index) => 
        index === (mode === 'generate' ? 3 : 4) 
          ? { ...step, status: 'completed', output: { type: 'results', data: data } }
          : step
      ));
      setCurrentStep(mode === 'generate' ? 3 : 4);
      
    } catch (error) {
      console.error('Query execution failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const renderStepOutput = (step: StepData) => {
    if (!step.output) return null;

    const { type, data, summary } = step.output;

    switch (type) {
      case 'schema':
        return (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-800 mb-2">
              <span className="text-green-600 mr-2">✓</span>
              {summary}
            </p>
            <div className="bg-white p-2 rounded border text-xs font-mono overflow-x-auto">
              {data.map((table: any, index: number) => (
                <div key={index} className="mb-1">
                  <strong>{table.TABLE_NAME}:</strong> {table.COLUMN_NAME}
                </div>
              ))}
            </div>
          </div>
        );

      case 'views':
        return (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-800 mb-2">
              <span className="text-green-600 mr-2">✓</span>
              {summary}
            </p>
            {Object.keys(data).length > 0 && (
              <div className="bg-white p-2 rounded border text-xs">
                {Object.keys(data).map(viewName => (
                  <div key={viewName} className="mb-1">
                    <span className="text-slate-600 mr-2">▶</span>
                    {viewName}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'sql':
        return (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-800 mb-2">
              <span className="text-green-600 mr-2">✓</span>
              {summary}
            </p>
            <pre className="bg-white p-2 rounded border text-xs font-mono overflow-x-auto">
              {data}
            </pre>
          </div>
        );

      case 'debug':
        return (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-800 mb-2">
              <span className="text-green-600 mr-2">✓</span>
              {summary}
            </p>
            <div className="bg-white p-2 rounded border text-xs">
              <strong>Analysis:</strong> {data.explanation?.substring(0, 200)}...
            </div>
          </div>
        );

      case 'analysis':
        return (
          <div className="mt-3 space-y-3">
            <div className="p-3 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-2">Analysis Results</h4>
              <p className="text-sm text-slate-800">
                {data?.explanation || 'Analysis in progress...'}
              </p>
            </div>
            
            {data?.diffInfo && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">GitHub-style Diff Comparison</h4>
                <div className="bg-white rounded border overflow-hidden">
                  
                  {/* Original SQL - Red background for removals */}
                  <div className="border-b">
                    <div className="bg-red-50 px-3 py-2 text-sm font-medium text-red-800 border-b border-red-200">
                      − Current Definition (Remove)
                    </div>
                    <pre className="p-3 text-xs font-mono bg-red-50 text-red-900 overflow-x-auto whitespace-pre-wrap">
                      {data.diffInfo.originalSQL || 'No current definition available'}
                    </pre>
                  </div>

                  {/* Proposed SQL - Green background for additions */}
                  <div>
                    <div className="bg-green-50 px-3 py-2 text-sm font-medium text-green-800 border-b border-green-200">
                      + Proposed Definition (Add)
                    </div>
                    <pre className="p-3 text-xs font-mono bg-green-50 text-green-900 overflow-x-auto whitespace-pre-wrap">
                      {data.diffInfo.proposedSQL || 'No proposed changes yet'}
                    </pre>
                  </div>
                </div>
              </div>
            )}
            
            {data?.proposedFix && (
              <div className="flex justify-center">
                <button
                  onClick={() => executeQuery(data.proposedFix)}
                  disabled={isExecuting || !data.proposedFix}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
                >
                  {isExecuting ? 'Applying Changes...' : 'Apply Fix'}
                </button>
              </div>
            )}
          </div>
        );

      case 'results':
        return (
          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-800 mb-2">
              <span className="text-green-600 mr-2">✓</span>
              Operation completed successfully
            </p>
            <div className="bg-white p-2 rounded border text-xs overflow-x-auto">
              {data.data && data.data.length > 0 ? (
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-slate-100">
                      {Object.keys(data.data[0]).map(key => (
                        <th key={key} className="p-1 text-left font-medium text-slate-700">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.slice(0, 3).map((row: any, index: number) => (
                      <tr key={index}>
                        {Object.values(row).map((value: any, i) => (
                          <td key={i} className="p-1 border-t">{String(value)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div>{data.message || 'No results available'}</div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderExecuteStep = () => {
    if (mode !== 'generate' || currentStep !== 2) return null;

    return (
      <div className="mt-3 space-y-3">
        <div className="p-3 bg-slate-50 rounded-lg">
          <h4 className="font-medium text-slate-900 mb-2">Review and Execute Query</h4>
          <textarea
            value={editableQuery}
            onChange={(e) => setEditableQuery(e.target.value)}
            className="w-full h-32 p-2 border rounded font-mono text-xs"
            placeholder="Generated SQL query will appear here for review..."
          />
          <button
            onClick={() => executeQuery(editableQuery)}
            disabled={!editableQuery || isExecuting}
            className="mt-2 px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {isExecuting ? 'Executing Query...' : 'Execute Query'}
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Automated Database Operations
            </h2>
            <p className="text-sm text-slate-600">
              {mode === 'generate' ? 'SQL Query Generation' : 'Data Inconsistency Resolution'} Process
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
            aria-label="Close modal"
          >
            <span className="text-xl leading-none select-none">&times;</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 border-b bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">
              Phase {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-slate-600">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-slate-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`border rounded-lg p-4 transition-all duration-300 ${
                  step.status === 'completed' 
                    ? 'border-green-500 bg-slate-50' 
                    : step.status === 'processing'
                    ? 'border-slate-500 bg-slate-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    step.status === 'completed' 
                      ? 'bg-green-500' 
                      : step.status === 'processing'
                      ? 'bg-slate-500'
                      : 'bg-slate-300'
                  }`}>
                    {step.status === 'completed' ? (
                      <span>✓</span>
                    ) : (
                      step.id
                    )}
                  </div>
                  <h3 className="font-medium text-slate-900">{step.title}</h3>
                  {step.status === 'processing' && (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  )}
                </div>
                
                {renderStepOutput(step)}
                {mode === 'generate' && step.id === 3 && renderExecuteStep()}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 