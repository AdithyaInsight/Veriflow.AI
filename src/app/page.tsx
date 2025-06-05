"use client";

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const navigateToPlayground = () => {
    router.push('/playground');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-8 text-center">AI Database Agent</h1>
        <p className="text-xl mb-8 text-center max-w-2xl">
          An agentic AI solution for database operations, allowing natural language SQL generation and data inconsistency debugging.
        </p>
        
        <div className="mb-8 text-center">
          <button
            onClick={navigateToPlayground}
            className="px-6 py-3 bg-indigo-600 text-white rounded-md shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 text-lg"
          >
            Launch Playground
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Workflow 1: SQL Generation</h2>
            <p className="text-gray-600">
              Describe the database object you want to create in natural language. The AI will generate the appropriate SQL query for you to review and execute.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Workflow 2: Debug Inconsistencies</h2>
            <p className="text-gray-600">
              Describe data inconsistencies you're encountering. The AI will analyze the issue and propose fixes to resolve the discrepancies.
            </p>
          </div>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Veriflow - Agentic AI for Database Operations</p>
        </div>
      </div>
    </main>
  );
}
