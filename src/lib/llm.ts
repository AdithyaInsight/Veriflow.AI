// src/lib/llm.ts
import OpenAI from 'openai';

// Initialize Azure OpenAI client with detailed logging
console.log('🔧 Initializing Azure OpenAI client...');
console.log('📍 Endpoint:', process.env.AZURE_OPENAI_ENDPOINT);
console.log('📅 API Version:', process.env.AZURE_OPENAI_API_VERSION);
console.log('🏷️ Model Name:', process.env.AZURE_OPENAI_MODEL_NAME);
console.log('🚀 Deployment:', process.env.AZURE_OPENAI_DEPLOYMENT);
console.log('🔑 API Key:', process.env.AZURE_OPENAI_API_KEY);

const baseURL = `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`;
console.log('🌐 Full Base URL:', baseURL);

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: baseURL,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION },
  defaultHeaders: {
    'Authorization': `Bearer ${process.env.AZURE_OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
});

/**
 * Generate SQL query using Azure OpenAI GPT-4.1
 * 
 * @param context A string containing the user prompt and database schema.
 * @returns A Promise resolving to the generated SQL query string.
 */
export async function generateSQL(context: string): Promise<string> {
  console.log("=== AZURE OPENAI SQL GENERATION START ===");
  console.log("📝 Context Length:", context.length);
  console.log("📝 Context Preview:", context.substring(0, 200) + "...");
  
  // Verify environment variables before making the call
  const requiredEnvVars = [
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_API_VERSION', 
    'AZURE_OPENAI_MODEL_NAME',
    'AZURE_OPENAI_DEPLOYMENT',
    'AZURE_OPENAI_API_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    const error = `Missing environment variables: ${missingVars.join(', ')}`;
    console.error("❌ Environment Error:", error);
    return `-- Environment Configuration Error: ${error}
-- Please check your .env.local file
SELECT 'Environment configuration incomplete' AS error_message;`;
  }

  try {
    console.log("🚀 Making API call to Azure OpenAI...");
    console.log("🔗 Request URL:", `${baseURL}/chat/completions?api-version=${process.env.AZURE_OPENAI_API_VERSION}`);
    
    // Use the deployment name as the model (like in the working example)
    const modelName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1-test';
    console.log("🤖 Using model name:", modelName);
    
    const completion = await openai.chat.completions.create({
      model: modelName, // Use deployment name as model name
      messages: [
        {
          role: 'system' as const,
          content: `You are an expert SQL database assistant. Your task is to generate accurate, efficient SQL queries based on user requests and database schema information.

Guidelines:
1. Generate syntactically correct SQL for the given database schema
2. Use proper SQL syntax and best practices
3. Include appropriate comments where helpful
4. If creating views or tables, use meaningful names
5. Handle edge cases and data type compatibility
6. Return ONLY the SQL query without additional explanation unless specifically requested
7. For date operations, use standard SQL date functions
8. Always consider data integrity and relationships between tables

When the user asks to create database objects (views, tables, etc.), generate the appropriate DDL statements.
When the user asks for data queries, generate appropriate SELECT statements.`
        },
        {
          role: 'user' as const,
          content: context
        }
      ],
      temperature: 0.1,
      max_tokens: 1000,
      top_p: 0.9
    });

    const generatedSql = completion.choices[0]?.message?.content || '';
    
    console.log("✅ API call successful!");
    console.log("📨 Response received, length:", generatedSql.length);
    console.log("📝 Generated SQL Preview:", generatedSql.substring(0, 200) + "...");
    console.log("=== AZURE OPENAI SQL GENERATION END ===");

    return generatedSql.trim();

  } catch (error: any) {
    console.error("=== AZURE OPENAI ERROR DETAILS ===");
    console.error("❌ Error Type:", error.constructor.name);
    console.error("❌ Error Message:", error.message);
    console.error("❌ Error Code:", error.code);
    console.error("❌ Error Status:", error.status);
    
    // Log more details if available
    if (error.response) {
      console.error("📡 Response Status:", error.response.status);
      console.error("📡 Response Headers:", error.response.headers);
      console.error("📡 Response Data:", error.response.data);
    }
    
    if (error.request) {
      console.error("📤 Request Details:", {
        url: error.request.url,
        method: error.request.method,
        headers: error.request.headers
      });
    }
    
    console.error("🔍 Full Error Object:", error);
    console.error("=== AZURE OPENAI ERROR DETAILS END ===");
    
    // Provide specific error messages based on error type
    let errorMessage = "Unknown error occurred";
    if (error.status === 401) {
      errorMessage = `Authentication failed. Please check:
1. Your API key is correct and not expired (current length: ${process.env.AZURE_OPENAI_API_KEY?.length})
2. The endpoint URL is correct for your Azure region
3. The deployment name matches your Azure OpenAI deployment
4. You have proper permissions for the deployment
5. Try using Bearer authorization instead of api-key header`;
    } else if (error.status === 404) {
      errorMessage = `Resource not found. Please check:
1. The deployment name (${process.env.AZURE_OPENAI_DEPLOYMENT}) exists
2. The endpoint URL is correct
3. The API version is supported`;
    } else if (error.status === 429) {
      errorMessage = "Rate limit exceeded. Please wait and try again.";
    }
    
    return `-- Error generating SQL: ${error.message}
-- ${errorMessage}
-- Please check your request and try again
SELECT 'SQL generation failed' AS error_message;`;
  }
}

/**
 * Debug data inconsistencies using Azure OpenAI GPT-4.1
 * 
 * @param problemDescription The user's description of the inconsistency.
 * @param relevantSchema The schema information relevant to the problem.
 * @param relevantData Optional data samples related to the inconsistency.
 * @returns A Promise resolving to an object containing an explanation and a proposed SQL fix.
 */
export async function debugInconsistency(
  problemDescription: string,
  relevantSchema: string,
  relevantData?: any
): Promise<{ explanation: string; proposedFix: string | null }> {
  console.log("=== AZURE OPENAI DEBUGGER START ===");
  console.log("🐛 Problem Description:", problemDescription);
  console.log("📋 Schema Length:", relevantSchema.length);
  if (relevantData) {
    console.log("📊 Additional Data:", JSON.stringify(relevantData, null, 2));
  }

  try {
    const contextPrompt = `Problem Description: ${problemDescription}

${relevantSchema}

${relevantData ? `Relevant Data: ${JSON.stringify(relevantData, null, 2)}` : ''}

Please analyze this data inconsistency issue and provide:
1. A clear explanation of what might be causing the discrepancy
2. A proposed SQL fix if applicable (or null if no fix is needed)

Format your response as JSON:
{
  "explanation": "Your detailed explanation here",
  "proposedFix": "SQL fix here or null"
}`;

    console.log("🚀 Making debug API call to Azure OpenAI...");

    // Use the deployment name as the model (like in the working example)
    const modelName = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4.1-test';

    const completion = await openai.chat.completions.create({
      model: modelName, // Use deployment name as model name
      messages: [
        {
          role: 'system' as const,
          content: `You are an expert database analyst specializing in data inconsistency debugging. Your task is to:

1. Analyze the described data inconsistency issues
2. Identify potential root causes such as:
   - Incorrect join conditions
   - Missing or incorrect WHERE clauses
   - Data type mismatches
   - Aggregation errors
   - Missing data in source tables
   - Filtering logic discrepancies
   - Timing issues (data refresh, synchronization)

3. Provide clear, actionable explanations
4. Suggest SQL fixes when appropriate
5. Always respond in valid JSON format

Be thorough but concise in your analysis. Focus on the most likely causes based on the schema and problem description.`
        },
        {
          role: 'user' as const,
          content: contextPrompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500,
      top_p: 0.95
    });

    const response = completion.choices[0]?.message?.content || '';
    
    console.log("✅ Debug API call successful!");
    console.log("📨 Raw response:", response);
    
    try {
      const parsedResponse = JSON.parse(response);
      
      console.log("✅ Successfully parsed JSON response");
      console.log("=== AZURE OPENAI DEBUGGER END ===");
      
      return {
        explanation: parsedResponse.explanation || "Unable to analyze the inconsistency.",
        proposedFix: parsedResponse.proposedFix || null
      };
      
    } catch (parseError) {
      console.warn("⚠️ Failed to parse JSON response, using fallback format");
      console.warn("Parse error:", parseError);
      
      const explanation = response.includes('explanation') 
        ? response.split('explanation')[1]?.split('proposedFix')[0]?.replace(/[:"]/g, '').trim() 
        : response;
        
      return {
        explanation: explanation || "Analysis completed but response format was unexpected.",
        proposedFix: null
      };
    }

  } catch (error: any) {
    console.error("=== AZURE OPENAI DEBUG ERROR ===");
    console.error("❌ Debug Error:", error);
    console.error("=== AZURE OPENAI DEBUG ERROR END ===");
    
    return {
      explanation: `Error analyzing inconsistency: ${error.message}. Please check your request and try again.`,
      proposedFix: null
    };
  }
}

