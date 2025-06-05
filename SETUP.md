# Azure OpenAI Integration Setup Guide

## 🚀 Quick Start

### 1. Environment Configuration

The project is already configured with your Azure OpenAI settings. A `.env.local` file has been created with the following configuration:

```env
# Azure OpenAI Configuration - GPT 4.1
AZURE_OPENAI_ENDPOINT=https://insightsoftwareai-us-dev-mirror.openai.azure.com/
AZURE_OPENAI_API_VERSION=2024-12-01-preview
AZURE_OPENAI_MODEL_NAME=gpt-4.1
AZURE_OPENAI_DEPLOYMENT=gpt-4.1-test

# Azure OpenAI Configuration - Embeddings
AZURE_OPENAI_EMBEDDINGS_ENDPOINT=https://insightsoftwareai-us-dev-mirror.openai.azure.com/
AZURE_OPENAI_EMBEDDINGS_API_VERSION=2023-05-15
AZURE_OPENAI_EMBEDDINGS_MODEL_NAME=text-embedding-ada-002
AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT=text-embedding-ada-002-deployment

# API Key for all Azure OpenAI services
AZURE_OPENAI_API_KEY=test-api-key
```

⚠️ **Important**: The API key is currently set to `test-api-key`. Please update it with your actual API key.

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Sample Database

```bash
npx tsx scripts/initLowDb.ts
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🧪 Testing the Integration

To test if Azure OpenAI integration is working:

```bash
npx tsx test-llm.js
```

This will make a test call to Azure OpenAI and display the generated SQL.

## 🏗️ What's Been Implemented

### ✅ Completed Features

1. **Azure OpenAI Integration**
   - Real LLM calls using OpenAI SDK configured for Azure
   - Proper error handling and fallbacks
   - Environment variable configuration

2. **Enhanced Context Building**
   - Structured prompts for better LLM performance
   - Automatic relationship inference between tables
   - Specialized contexts for debugging workflows

3. **Two Main Workflows**
   - **SQL Generation**: Natural language → SQL queries
   - **Data Inconsistency Debugging**: Problem description → Analysis + fixes

4. **User Interface**
   - Clean Next.js web interface
   - Tabbed interface for both workflows
   - SQL preview and confirmation modals
   - Results display and error handling

### 🔄 Ready for Testing

1. **SQL Generation Workflow**
   - Navigate to `/playground`
   - Select "SQL Generation" tab
   - Enter prompts like:
     - "Create a view showing customer names and total purchase amounts"
     - "Show me all transactions from the last month"
     - "Create a table for product categories"

2. **Debug Inconsistency Workflow**
   - Select "Debug Inconsistency" tab
   - Enter problem descriptions like:
     - "The total transaction count seems lower than expected"
     - "Customer totals don't match between reports"

## 🔧 Technical Architecture

### LLM Integration (`src/lib/llm.ts`)
- **generateSQL()**: Converts natural language to SQL
- **debugInconsistency()**: Analyzes data problems and suggests fixes
- Configured for Azure OpenAI GPT-4.1 model

### Context Building (`src/lib/contextBuilder.ts`)
- **buildContext()**: Creates structured prompts for SQL generation
- **buildDebugContext()**: Creates specialized prompts for debugging
- **inferRelationships()**: Automatically detects table relationships

### API Endpoints
- **`/api/generate-sql`**: Handles SQL generation requests
- **`/api/debug-inconsistency`**: Handles debugging analysis

### Database Layer (`src/lib/schemaFetcher.ts`)
- Currently using LowDB (JSON file-based) for rapid prototyping
- Dynamically infers schema from JSON data
- Ready for migration to Azure SQL/Oracle

## 🔒 Security Notes

- Environment variables are properly excluded from version control
- API keys are never hardcoded in source code
- Database credentials should follow least privilege principle

## 📝 Next Steps

1. **Update API Key**: Replace `test-api-key` in `.env.local` with your actual key
2. **Test Workflows**: Use the playground to test both SQL generation and debugging
3. **Monitor Logs**: Check console output for detailed LLM interactions
4. **Real Database**: Consider migrating from LowDB to Azure SQL for production use

## 🐛 Troubleshooting

### Common Issues

1. **API Key Error**: Make sure your API key is valid and has proper permissions
2. **Endpoint Issues**: Verify the Azure OpenAI endpoint is accessible
3. **Model Deployment**: Ensure the model deployment name matches your Azure configuration

### Debug Commands

```bash
# Test LLM integration
npx tsx test-llm.js

# Check database schema
npx tsx -e "import { getSchemaInfo } from './src/lib/schemaFetcher.ts'; getSchemaInfo().then(console.log)"

# Verify environment variables
node -e "console.log(process.env.AZURE_OPENAI_ENDPOINT)"
``` 