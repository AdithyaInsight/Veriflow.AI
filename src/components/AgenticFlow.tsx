"use client";

import React, { useState, useEffect } from 'react';

interface AgentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  timestamp: Date;
  details?: string;
  icon: string;
}

interface AgenticFlowProps {
  isActive: boolean;
  mode: 'generate' | 'debug';
  onStepComplete?: (step: AgentStep) => void;
  showDetails: boolean;
}

export default function AgenticFlow({ isActive, mode, onStepComplete, showDetails }: AgenticFlowProps) {
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Define step templates for different workflows
  const generateSteps: Omit<AgentStep, 'id' | 'timestamp' | 'status'>[] = [
    {
      title: "Processing User Request",
      description: "Analyzing your natural language prompt for intent and requirements",
      icon: "PARSE",
      details: "Parsing prompt structure, identifying keywords, and determining SQL operation type"
    },
    {
      title: "Fetching Database Schema",
      description: "Retrieving table structures, columns, and relationships",
      icon: "SCHEMA",
      details: "Querying INFORMATION_SCHEMA to understand available tables and data types"
    },
    {
      title: "Building Context for AI",
      description: "Preparing comprehensive context with schema and business rules",
      icon: "CONTEXT",
      details: "Combining user request with database metadata for optimal SQL generation"
    },
    {
      title: "Calling Azure OpenAI GPT-4.1",
      description: "Generating SQL using advanced language model",
      icon: "AI",
      details: "Leveraging GPT-4.1 with specialized database prompts for accurate SQL creation"
    },
    {
      title: "SQL Generation Complete",
      description: "Generated syntactically correct and optimized SQL query",
      icon: "DONE",
      details: "Final validation and formatting of generated SQL statement"
    }
  ];

  const debugSteps: Omit<AgentStep, 'id' | 'timestamp' | 'status'>[] = [
    {
      title: "Analyzing Problem Description",
      description: "Understanding the data inconsistency issue",
      icon: "ANALYZE",
      details: "Extracting key entities, relationships, and potential problem areas"
    },
    {
      title: "Detecting Referenced Objects",
      description: "Identifying views, tables, and columns mentioned",
      icon: "DETECT",
      details: "Using pattern matching to find database objects in problem description"
    },
    {
      title: "Fetching Schema & View Definitions",
      description: "Retrieving current database structure and existing views",
      icon: "FETCH",
      details: "Loading table schemas and view definitions for comparison analysis"
    },
    {
      title: "Building Debug Context",
      description: "Assembling comprehensive analysis context",
      icon: "BUILD",
      details: "Combining problem description, schema, and existing view definitions"
    },
    {
      title: "AI Inconsistency Analysis",
      description: "Azure OpenAI analyzing potential root causes",
      icon: "PROCESS",
      details: "Deep analysis of joins, filters, aggregations, and data flow logic"
    },
    {
      title: "Generating Diff Comparison",
      description: "Creating side-by-side comparison of current vs proposed solution",
      icon: "DIFF",
      details: "GitHub-style diff generation showing exact changes needed"
    },
    {
      title: "Debug Analysis Complete",
      description: "Comprehensive solution with explanation and proposed fix",
      icon: "COMPLETE",
      details: "Ready to apply fix or provide detailed explanation to user"
    }
  ];

  const getStepsForMode = () => mode === 'generate' ? generateSteps : debugSteps;

  // Initialize steps when component becomes active
  useEffect(() => {
    if (isActive) {
      const stepTemplates = getStepsForMode();
      const initialSteps = stepTemplates.map((template, index) => ({
        ...template,
        id: `step-${index}`,
        timestamp: new Date(),
        status: index === 0 ? 'processing' : 'pending'
      } as AgentStep));
      
      setSteps(initialSteps);
      setCurrentStepIndex(0);
      
      // Simulate step progression
      simulateStepProgression(initialSteps);
    } else {
      setSteps([]);
      setCurrentStepIndex(0);
    }
  }, [isActive, mode]);

  const simulateStepProgression = (initialSteps: AgentStep[]) => {
    initialSteps.forEach((_, index) => {
      setTimeout(() => {
        setSteps(prevSteps => 
          prevSteps.map((step, i) => {
            if (i === index) {
              return { ...step, status: 'completed', timestamp: new Date() };
            } else if (i === index + 1) {
              return { ...step, status: 'processing', timestamp: new Date() };
            }
            return step;
          })
        );
        
        if (index < initialSteps.length - 1) {
          setCurrentStepIndex(index + 1);
        }
        
        if (onStepComplete) {
          onStepComplete(initialSteps[index]);
        }
      }, (index + 1) * 1200); // Increased to 1200ms for better demo pacing
    });
  };

  const getStatusIcon = (status: AgentStep['status']) => {
    switch (status) {
      case 'completed': return '✓';
      case 'processing': return '●';
      case 'error': return '✗';
      default: return '○';
    }
  };

  const getStatusColor = (status: AgentStep['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'processing': return 'text-blue-600 animate-pulse';
      case 'error': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  if (!isActive || steps.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          AI Agent Processing 
          <span className="ml-2 text-sm font-normal text-gray-600">
            ({mode === 'generate' ? 'SQL Generation' : 'Debug Analysis'})
          </span>
        </h3>
        <div className="text-sm text-gray-500">
          Step {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-300 ${
              step.status === 'processing' 
                ? 'bg-blue-50 border-l-4 border-blue-400' 
                : step.status === 'completed'
                ? 'bg-green-50 border-l-4 border-green-400'
                : 'bg-white border-l-4 border-gray-200'
            }`}
          >
            <div className="text-sm font-mono font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {step.icon}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className={`text-lg ${getStatusColor(step.status)}`}>
                  {getStatusIcon(step.status)}
                </span>
                <h4 className="font-medium text-gray-900">{step.title}</h4>
                {step.status === 'processing' && (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
              
              {showDetails && step.details && (step.status === 'processing' || step.status === 'completed') && (
                <div className="mt-2 p-2 bg-white rounded border text-xs text-gray-700 font-mono">
                  Internal: {step.details}
                </div>
              )}
            </div>
            
            <div className="text-xs text-gray-400">
              {step.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      {currentStepIndex >= steps.length - 1 && steps[steps.length - 1]?.status === 'completed' && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-green-800">✓</span>
            <span className="font-medium text-green-800">
              AI Agent Processing Complete!
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 