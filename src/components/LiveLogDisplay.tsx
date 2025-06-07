"use client";

import React, { useState, useEffect, useRef } from 'react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error';
  category: string;
  message: string;
  details?: string;
}

interface LiveLogDisplayProps {
  isActive: boolean;
  mode: 'generate' | 'debug';
  onNewLog?: (log: LogEntry) => void;
}

export default function LiveLogDisplay({ isActive, mode, onNewLog }: LiveLogDisplayProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Sample logs that simulate backend processing
  const generateLogs: Omit<LogEntry, 'id' | 'timestamp'>[] = [
    { level: 'info', category: 'API', message: 'Received SQL generation request', details: 'Processing natural language prompt...' },
    { level: 'info', category: 'Schema', message: 'Fetching database schema', details: 'Querying INFORMATION_SCHEMA tables...' },
    { level: 'success', category: 'Schema', message: 'Found 2 tables: Customers, Transactions', details: 'Schema loaded successfully' },
    { level: 'info', category: 'Context', message: 'Building LLM context', details: 'Combining user prompt with schema metadata...' },
    { level: 'success', category: 'Context', message: 'Context prepared (1,247 tokens)', details: 'Ready for AI processing' },
    { level: 'info', category: 'LLM', message: 'Calling Azure OpenAI GPT-4.1', details: 'Sending request to language model...' },
    { level: 'info', category: 'LLM', message: 'Azure OpenAI processing...', details: 'Model analyzing request and generating SQL...' },
    { level: 'success', category: 'LLM', message: 'Received SQL response (342 chars)', details: 'SQL generation completed successfully' },
    { level: 'success', category: 'API', message: 'SQL generation complete!', details: 'Ready to present to user' }
  ];

  const debugLogs: Omit<LogEntry, 'id' | 'timestamp'>[] = [
    { level: 'info', category: 'Debug', message: 'Starting inconsistency analysis', details: 'Parsing problem description...' },
    { level: 'info', category: 'Parser', message: 'Detecting referenced objects', details: 'Found mention of "ActiveCustomers" view' },
    { level: 'success', category: 'Parser', message: 'Extracted view name: ActiveCustomers', details: 'Pattern matching successful' },
    { level: 'info', category: 'Schema', message: 'Fetching existing view definitions', details: 'Loading view metadata from database...' },
    { level: 'success', category: 'Schema', message: 'Found existing view definition', details: 'ActiveCustomers view located' },
    { level: 'info', category: 'Context', message: 'Building debug context', details: 'Combining problem + schema + view definitions...' },
    { level: 'info', category: 'LLM', message: 'Calling Azure OpenAI for analysis', details: 'Deep analysis of data inconsistency...' },
    { level: 'success', category: 'LLM', message: 'Analysis complete - root cause identified', details: 'WHERE clause filtering detected' },
    { level: 'info', category: 'Diff', message: 'Generating diff comparison', details: 'Creating GitHub-style diff view...' },
    { level: 'success', category: 'Diff', message: 'Diff generated successfully', details: 'Ready to show proposed changes' },
    { level: 'success', category: 'Debug', message: 'Debug analysis complete!', details: 'Solution ready for user review' }
  ];

  const getCurrentLogs = () => mode === 'generate' ? generateLogs : debugLogs;

  useEffect(() => {
    if (isActive) {
      setLogs([]);
      const currentLogs = getCurrentLogs();
      
      currentLogs.forEach((logTemplate, index) => {
        setTimeout(() => {
          const newLog: LogEntry = {
            ...logTemplate,
            id: `log-${Date.now()}-${index}`,
            timestamp: new Date()
          };
          
          setLogs(prevLogs => [...prevLogs, newLog]);
          
          if (onNewLog) {
            onNewLog(newLog);
          }
        }, (index + 1) * 400); // 400ms between log entries
      });
    } else {
      setLogs([]);
    }
  }, [isActive, mode]);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return '✓';
      case 'warning': return '!';
      case 'error': return '✗';
      default: return 'i';
    }
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'API': 'bg-blue-100 text-blue-800',
      'Schema': 'bg-purple-100 text-purple-800',
      'Context': 'bg-green-100 text-green-800',
      'LLM': 'bg-orange-100 text-orange-800',
      'Debug': 'bg-indigo-100 text-indigo-800',
      'Parser': 'bg-yellow-100 text-yellow-800',
      'Diff': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="bg-black text-green-400 rounded-lg p-4 mb-4 font-mono text-sm max-h-80 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-green-500">●</span>
          <h3 className="text-green-300 font-semibold">Live Agent Logs</h3>
          <span className="text-green-600">({mode === 'generate' ? 'SQL Gen' : 'Debug'})</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="w-3 h-3"
            />
            <span className="text-xs text-green-300">Auto-scroll</span>
          </label>
          <button
            onClick={() => setLogs([])}
            className="text-xs text-green-400 hover:text-green-200 px-2 py-1 border border-green-600 rounded"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="space-y-1 max-h-60 overflow-y-auto">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start space-x-2 py-1">
            <span className="text-gray-500 text-xs w-20 flex-shrink-0">
              {log.timestamp.toLocaleTimeString().split(' ')[0]}
            </span>
            
            <span className={`text-lg ${getLevelColor(log.level)} flex-shrink-0`}>
              {getLevelIcon(log.level)}
            </span>
            
            <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${getCategoryColor(log.category)}`}>
              {log.category}
            </span>
            
            <div className="flex-1 min-w-0">
              <div className="text-green-300">{log.message}</div>
              {log.details && (
                <div className="text-green-600 text-xs mt-1 opacity-80">
                  └─ {log.details}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
      
      {logs.length === 0 && (
        <div className="text-center text-green-600 py-8">
          <div className="text-2xl mb-2 font-bold">AI</div>
          <div>Waiting for agent activity...</div>
        </div>
      )}
    </div>
  );
} 