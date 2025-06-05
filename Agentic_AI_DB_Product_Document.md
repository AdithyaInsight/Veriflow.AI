# AI Hackathon Product: Agentic AI for Database Operations

## 1. Introduction

This document outlines a product concept for an AI Hackathon focused on Agentic AI. The proposed product aims to leverage AI agents to streamline and automate complex database operations, specifically focusing on dynamic object creation and intelligent data inconsistency debugging. The core idea is to empower users, potentially database administrators, developers, or data analysts, to interact with their database using natural language prompts, allowing the AI agent to handle the underlying query generation, execution, and troubleshooting.

Currently, managing database objects (like tables, views, stored procedures) and diagnosing data discrepancies often requires significant manual effort, deep technical expertise in SQL and database architecture, and time-consuming investigation. This AI product intends to drastically reduce this overhead by introducing an intelligent layer that understands user intent, interacts with the database schema, generates appropriate SQL queries, previews changes, executes commands upon approval, and proactively identifies and explains data inconsistencies.

The product features two primary workflows designed to address common database management challenges:

- **Workflow 1: AI-Powered Database Object Creation:** Users describe the desired database object (e.g., a view summarizing sales data, a table for customer demographics) in natural language. The AI agent analyzes the prompt, consults the existing database schema (base tables), generates the corresponding SQL query (e.g., `CREATE VIEW`, `CREATE TABLE`), presents a preview of the query and potentially the resulting object structure or sample data, and upon user acceptance, executes the query to create the object within the database environment.

- **Workflow 2: AI-Driven Data Inconsistency Debugging:** Users describe a data inconsistency issue they are observing (e.g., "Why does the total revenue in the monthly report view not match the sum of individual transaction amounts for last month?"). The AI agent identifies the relevant database objects (tables, views, procedures) involved, fetches their defining queries and relevant data, compares them to pinpoint the source of the discrepancy, summarizes the findings for the user, proposes corrective SQL query modifications (e.g., `ALTER VIEW`, `UPDATE` statements), shows a preview of the changes, and applies the fix upon user confirmation.

This agentic approach not only simplifies database tasks but also enhances accuracy by providing previews and explanations before any changes are committed. It targets improving productivity for technical teams and potentially making database interactions more accessible to less technical users within an organization. The following sections will delve deeper into the user flows, proposed technical stack, system requirements, architecture, and overall workflow of this AI agent.

## 2. User Flows and Workflows

This section details the step-by-step user interactions and system processes for the two core workflows of the Agentic AI database tool.

### Workflow 1: AI-Powered Database Object Creation

This workflow enables users to create database objects like views or tables using natural language prompts.

1. **User Input:** The user initiates the process by providing a natural language prompt describing the desired database object.
  - *Example Prompt:* "Create a view named `active_customer_summary` that shows the customer ID, name, email, and total order value for customers who have placed an order in the last 6 months from the `customers` and `orders` tables."

1. **AI Prompt Processing:** The AI agent receives the prompt and parses it to understand the user's intent, identifying the desired object type (view), name (`active_customer_summary`), required data fields (customer ID, name, email, total order value), source tables (`customers`, `orders`), and filtering conditions (orders in the last 6 months).

1. **Schema Analysis:** The AI agent accesses the database metadata (schema) to understand the structure of the referenced base tables (`customers`, `orders`), including column names, data types, and relationships (keys).

1. **Query Generation:** Based on the processed prompt and schema understanding, the AI agent constructs the appropriate SQL query.
  - *Example Generated SQL:*

1. **Preview Presentation:** The AI agent presents the generated SQL query to the user for review. It may also provide a preview of the expected view structure (columns and data types) or even sample data queried from the potential view (if feasible and safe).

1. **User Review & Decision:** The user examines the generated SQL query and the preview to ensure it matches their requirements. The user then chooses to either accept or reject the proposed creation.

1. **Execution (on Acceptance):** If the user accepts, the AI agent connects to the target database environment and executes the generated `CREATE VIEW` (or `CREATE TABLE`, etc.) statement.

1. **Confirmation/Error Reporting:** The AI agent monitors the execution result.
  - If successful, it confirms to the user that the object (`active_customer_summary` view) has been created.
  - If an error occurs during execution (e.g., syntax error, permission issue), it reports the error message back to the user.

### Workflow 2: AI-Driven Data Inconsistency Debugging

This workflow assists users in diagnosing and potentially fixing data discrepancies within the database.

1. **User Input:** The user describes a data inconsistency issue they are encountering using natural language.
  - *Example Prompt:* "The total count of users in the `daily_active_users` view for yesterday seems lower than expected. It doesn't match the raw count from the `user_logins` table for the same day. Can you investigate why?"

1. **AI Prompt Processing:** The AI agent parses the prompt to understand the problem: identify the objects involved (`daily_active_users` view, `user_logins` table), the nature of the discrepancy (count mismatch), and the relevant time frame (yesterday).

1. **Object Identification & Analysis:** The AI agent identifies all relevant database objects. This includes fetching the definition (SQL query) of the `daily_active_users` view and understanding the structure of the `user_logins` table.

1. **Data Fetching:** The agent executes queries to fetch relevant data segments from both the view and the base table for the specified period (yesterday). For instance, it might query `SELECT COUNT(*) FROM daily_active_users WHERE date = 'yesterday'` and `SELECT COUNT(DISTINCT user_id) FROM user_logins WHERE login_timestamp >= 'yesterday_start' AND login_timestamp < 'today_start'`.

1. **Discrepancy Analysis:** The AI agent compares the view's definition (SQL logic) and the fetched data against the data from the base table(s). It looks for potential causes like incorrect join conditions, flawed filtering logic in the view definition, data type mismatches, missing data in source tables, or aggregation errors.

1. **Summary Generation:** The agent synthesizes its findings into a clear, concise summary explaining the likely root cause of the inconsistency.
  - *Example Summary:* "The discrepancy occurs because the `daily_active_users` view filters out users with a 'suspended' status, while your comparison query on `user_logins` includes all users regardless of status. Yesterday, 5 users who logged in had a 'suspended' status, leading to the count difference."

1. **Solution Proposal:** Based on the analysis, the AI agent proposes potential solutions. This might involve suggesting modifications to the view's SQL query or highlighting the specific logic causing the difference.
  - *Example Proposed Fix (if modification is desired):* "To include suspended users in the view count, the `WHERE` clause in the `daily_active_users` view definition needs to be adjusted. Proposed updated query: [Shows modified SQL query removing the status filter]"

1. **Preview Presentation:** The agent presents the summary, the proposed SQL fix (if applicable), and potentially a preview of the data if the fix were applied (e.g., the recalculated count).

1. **User Review & Decision:** The user reviews the explanation, the proposed fix, and the preview. They decide whether to accept the proposed changes, reject them, or perhaps just use the information provided for manual adjustments.

1. **Execution (on Acceptance):** If the user accepts a proposed SQL modification (e.g., `ALTER VIEW`), the AI agent executes the corrective query against the database.

1. **Confirmation/Error Reporting:** The agent confirms whether the update was successful or reports any errors encountered during execution.

## 3. Technical Stack and Requirements

This section outlines the proposed technical stack and key requirements for developing the Agentic AI database tool, particularly focusing on the Proof of Concept (POC) for the hackathon.

### 3.1. Proposed Technical Stack

• LLM: GPT 4o model hosted by azure in github.com/models

•Agent Framework: MPC for the database interaction.

•Programming Language: TypeScript and Java Script.

•Database Connectivity: Microsoft SQL Server, node package to connect to sql server

•Database Schema Access: Need to be decided weather we will get form the database connection or using

•Backend API: Next JS Server side APIs

•Frontend: Next JS

•Metadata databases: Currently we will not have any metadata to store the history of the prompts. We will just execute the workflows

### 3.2. Functional Requirements

- **Natural Language Understanding:** The system must accurately interpret user prompts for both object creation and inconsistency debugging.

- **Schema Awareness:** The agent must be able to dynamically query and understand the schema of the connected database.

- **SQL Generation:** The agent must generate syntactically correct and logically sound SQL queries (DDL for creation, DML/Query for analysis and debugging) based on user prompts and schema.

- **Query Preview:** The system must display the generated SQL to the user before execution.

- **Execution Control:** The system must only execute generated SQL against the database upon explicit user acceptance.

- **Database Interaction:** The system must securely connect to the target database (Azure SQL or Oracle), execute queries, and fetch results/metadata.

- **Error Handling:** The system must gracefully handle errors during SQL generation, database connection, or query execution and report them to the user.

- **Discrepancy Analysis (Workflow 2):** The agent must be able to fetch relevant data, compare logic and results from different objects (e.g., view vs. base tables), and identify potential causes for inconsistencies.

- **Result Summarization:** The agent must provide clear, concise summaries of its findings, especially during the debugging workflow.

### 3.3. Non-Functional Requirements (Considerations for POC)

- **Security:** Database credentials must be handled securely (e.g., environment variables, configuration files, secrets management – avoid hardcoding). The agent's permissions within the database should be limited to necessary actions (least privilege principle).

- **Performance:** While deep optimization might be out of scope for a hackathon, the agent should respond within a reasonable timeframe. Query generation and analysis should be efficient enough for typical use cases.

- **Accuracy:** The generated SQL and inconsistency analysis must be highly accurate to be useful and trustworthy.

- **Usability (POC):** The interface (CLI or basic UI) should be simple and intuitive for users to input prompts and review results/previews.

## 4. System Architecture Overview

This section describes the high-level architecture of the Agentic AI database tool, outlining the key components and their interactions.

```
graph LR
    User --> UI[User Interface (CLI/Web)];
    UI --> AgentCore{AI Agent Core};
    AgentCore --> LLM[LLM Service (e.g., GPT, Claude)];
    AgentCore --> DBInterface[Database Interface];
    DBInterface --> TargetDB[(Target Database
Azure SQL / Oracle)];
    LLM --> AgentCore;
    TargetDB --> DBInterface;
    DBInterface --> AgentCore;
    AgentCore --> UI;

    subgraph AI Agent Core
        direction TB
        Orchestrator[Workflow Orchestrator]
        PromptMgr[Prompt Manager]
        SQLGen[SQL Generator]
        DebugAnalyzer[Debugging Analyzer]
        SchemaMgr[Schema Manager]
        Orchestrator --> PromptMgr;
        Orchestrator --> SQLGen;
        Orchestrator --> DebugAnalyzer;
        Orchestrator --> SchemaMgr;
        Orchestrator --> DBInterface;
        PromptMgr --> LLM;
        SQLGen --> LLM;
        DebugAnalyzer --> LLM;
        SchemaMgr --> DBInterface;
    end
```

*Diagram: High-Level System Architecture*

### 4.1. Components

1. **User Interface (UI):** The layer through which the user interacts with the system. For the POC, this could be a Command-Line Interface (CLI) or a simple web application (e.g., built with Streamlit/Gradio). It accepts natural language prompts from the user and displays results, previews, and confirmations.

1. **AI Agent Core:** The central brain of the system, responsible for orchestrating the workflows. It contains several sub-components:
  - **Workflow Orchestrator:** Manages the overall flow for both object creation and debugging tasks. It receives user input from the UI, coordinates calls to other components (LLM, DB Interface), and sequences the steps (prompt processing, schema fetching, SQL generation/analysis, preview, execution).
  - **Prompt Manager:** Constructs specific prompts tailored for the LLM based on the user's request, the current workflow step, and retrieved database schema information.
  - **Schema Manager:** Interacts with the Database Interface to fetch and cache database metadata (table structures, view definitions, etc.). Provides schema context to the SQL Generator and Debugging Analyzer.
  - **SQL Generator (for Workflow 1):** Takes the processed user request and schema information, potentially leveraging the LLM via the Prompt Manager, to generate the required SQL DDL (e.g., `CREATE VIEW`, `CREATE TABLE`).
  - **Debugging Analyzer (for Workflow 2):** Orchestrates the process of identifying relevant objects, fetching data/definitions via the Database Interface, comparing information, identifying discrepancies, and formulating explanations and potential fixes, often involving interaction with the LLM for analysis and summarization.

1. **LLM Service:** An external Large Language Model service (like GPT-4, Claude, Gemini). It receives structured prompts from the Agent Core and returns generated SQL code, analysis results, summaries, or other natural language responses as required by the workflow.

1. **Database Interface:** A module responsible for managing connections to the target database(s) (Azure SQL, Oracle). It executes SQL queries provided by the Agent Core (both for fetching metadata/data and for executing user-approved DDL/DML) and returns the results or status.

1. **Target Database:** The client's database environment (Azure SQL or Oracle) containing the base tables and where new objects will be created or existing ones analyzed/modified.

### 4.2. Interaction Flow (Example: Workflow 1 - Object Creation)

1. **User Input:** User submits a prompt like "Create a view..." via the UI.

1. **Orchestration:** The UI sends the prompt to the AI Agent Core's Orchestrator.

1. **Schema Fetching:** The Orchestrator, via the Schema Manager and Database Interface, fetches relevant schema information from the Target Database.

1. **LLM Interaction:** The Orchestrator uses the Prompt Manager to construct a detailed prompt (including user request and schema context) for the LLM Service, requesting SQL generation.

1. **SQL Generation:** The LLM Service processes the prompt and returns the generated SQL query (e.g., `CREATE VIEW ...`).

1. **Preview:** The Orchestrator sends the generated SQL back to the UI for user preview.

1. **User Confirmation:** User reviews the SQL and clicks "Accept" in the UI.

1. **Execution:** The UI signals acceptance to the Orchestrator. The Orchestrator passes the SQL query to the Database Interface for execution against the Target Database.

1. **Feedback:** The Database Interface returns the execution status (success/error) to the Orchestrator, which relays the final confirmation or error message to the user via the UI.

### 4.3. Interaction Flow (Example: Workflow 2 - Debugging)

1. **User Input:** User submits a prompt like "Why is the count in view X wrong..." via the UI.

1. **Orchestration:** The UI sends the prompt to the AI Agent Core's Orchestrator.

1. **Analysis Setup:** The Orchestrator activates the Debugging Analyzer. It identifies potentially relevant objects (view X, source tables) based on the prompt.

1. **Information Gathering:** The Analyzer, through the Schema Manager and Database Interface, fetches the definition of view X and the structure/relevant data from source tables in the Target Database.

1. **LLM Analysis/Comparison:** The Analyzer may structure the gathered information (view definition, sample data, user's issue description) and use the Prompt Manager to query the LLM Service for analysis, comparison, and identification of the discrepancy's cause.

1. **Summary & Solution:** The LLM Service returns an analysis/summary. The Analyzer might also generate or ask the LLM to generate a potential SQL fix (e.g., `ALTER VIEW`).

1. **Preview:** The Orchestrator sends the summary, potential fix, and any relevant data previews back to the UI.

1. **User Confirmation:** User reviews the analysis and proposed fix, and decides whether to accept the fix.

1. **Execution (Optional):** If the user accepts the fix, the UI signals acceptance. The Orchestrator passes the corrective SQL to the Database Interface for execution.

1. **Feedback:** The Database Interface returns the execution status, which the Orchestrator relays to the UI.

