// src/app/playground/page.tsx
"use client";

import React, { useState } from "react";
import StepByStepModal from "@/components/StepByStepModal";

type Mode = "generate" | "debug";

export default function PlaygroundPage() {
  const [mode, setMode] = useState<Mode>("generate");
  const [prompt, setPrompt] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt first!");
      return;
    }
    setIsModalOpen(true);
  };

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    setPrompt("");
  };

  const examplePrompts = {
    generate: [
      "Create a view showing active customers who signed up in the last 30 days",
      "Show me total transaction amounts per customer",
      "List all customers with their most recent transaction",
      "Create a summary view of monthly revenue"
    ],
    debug: [
      "The ActiveCustomers view shows fewer records than expected compared to the Customers table",
      "The daily revenue totals don't match between the TransactionSummary view and raw data",
      "Customer count discrepancy between CustomerStats view and actual customer records",
      "The monthly reporting view excludes some valid transactions"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgIDxwYXRoIGQ9Ik0gMTAwIDAgTCAwIDAgMCAxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMDAwMDEwIiBzdHJva2Utd2lkdGg9IjEiLz4KICAgIDwvcGF0dGVybj4gICAgCiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz4KPC9zdmc+')] opacity-30"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <span className="text-2xl">🤖</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Veriflow AI Agent
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful AI-driven database operations with intelligent SQL generation and data inconsistency debugging
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-2 shadow-lg border">
            <button
              onClick={() => handleModeSwitch("generate")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                mode === "generate"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg mr-2">⚡</span>
              SQL Generation
            </button>
            <button
              onClick={() => handleModeSwitch("debug")}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                mode === "debug"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg mr-2">🔍</span>
              Debug Inconsistencies
            </button>
          </div>
        </div>

        {/* Main Input Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                {mode === "generate" ? (
                  <>
                    <span className="text-2xl mr-3">⚡</span>
                    Generate SQL from Natural Language
                  </>
                ) : (
                  <>
                    <span className="text-2xl mr-3">🔍</span>
                    Debug Data Inconsistencies
                  </>
                )}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {mode === "generate" 
                  ? "Describe what you want to query, and our AI will generate optimized SQL for you"
                  : "Describe the data inconsistency problem, and our AI will analyze and provide solutions"
                }
              </p>
            </div>

            {/* Input Area */}
            <div className="p-6">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === "generate" 
                  ? "e.g., Create a view showing all customers who made transactions in the last 30 days with their total spending..."
                  : "e.g., The customer count in the ActiveCustomers view is lower than expected. It should match the total customers in the Customers table, but it's showing 20% fewer records..."
                }
                className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
              
              {/* Generate Button */}
              <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-gray-500">
                  {prompt.length}/1000 characters
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim()}
                  className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg ${
                    prompt.trim()
                      ? mode === "generate"
                        ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-200"
                        : "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-indigo-200"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span className="text-lg mr-2">🚀</span>
                  {mode === "generate" ? "Generate SQL" : "Analyze Issue"}
                </button>
              </div>
            </div>
          </div>

          {/* Example Prompts */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
              💡 Try these examples:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {examplePrompts[mode].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="text-left p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 text-sm text-gray-700 hover:text-gray-900"
                >
                  <span className="text-blue-500 mr-2">→</span>
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-sm text-gray-600">
                Leverages advanced Azure OpenAI GPT-4.1 for intelligent SQL generation and analysis
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Processing</h3>
              <p className="text-sm text-gray-600">
                Watch the AI agent work through each step of the process in real-time
              </p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Debugging</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Modal */}
      <StepByStepModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={mode}
        prompt={prompt}
      />
    </div>
  );
}
