## 4. System Architecture Overview

This section describes the high-level architecture of the Agentic AI database tool, outlining the key components and their interactions.

```mermaid
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

1.  **User Interface (UI):** The layer through which the user interacts with the system. For the POC, this could be a Command-Line Interface (CLI) or a simple web application (e.g., built with Streamlit/Gradio). It accepts natural language prompts from the user and displays results, previews, and confirmations.
2.  **AI Agent Core:** The central brain of the system, responsible for orchestrating the workflows. It contains several sub-components:
    *   **Workflow Orchestrator:** Manages the overall flow for both object creation and debugging tasks. It receives user input from the UI, coordinates calls to other components (LLM, DB Interface), and sequences the steps (prompt processing, schema fetching, SQL generation/analysis, preview, execution).
    *   **Prompt Manager:** Constructs specific prompts tailored for the LLM based on the user's request, the current workflow step, and retrieved database schema information.
    *   **Schema Manager:** Interacts with the Database Interface to fetch and cache database metadata (table structures, view definitions, etc.). Provides schema context to the SQL Generator and Debugging Analyzer.
    *   **SQL Generator (for Workflow 1):** Takes the processed user request and schema information, potentially leveraging the LLM via the Prompt Manager, to generate the required SQL DDL (e.g., `CREATE VIEW`, `CREATE TABLE`).
    *   **Debugging Analyzer (for Workflow 2):** Orchestrates the process of identifying relevant objects, fetching data/definitions via the Database Interface, comparing information, identifying discrepancies, and formulating explanations and potential fixes, often involving interaction with the LLM for analysis and summarization.
3.  **LLM Service:** An external Large Language Model service (like GPT-4, Claude, Gemini). It receives structured prompts from the Agent Core and returns generated SQL code, analysis results, summaries, or other natural language responses as required by the workflow.
4.  **Database Interface:** A module responsible for managing connections to the target database(s) (Azure SQL, Oracle). It executes SQL queries provided by the Agent Core (both for fetching metadata/data and for executing user-approved DDL/DML) and returns the results or status.
5.  **Target Database:** The client's database environment (Azure SQL or Oracle) containing the base tables and where new objects will be created or existing ones analyzed/modified.

### 4.2. Interaction Flow (Example: Workflow 1 - Object Creation)

1.  **User Input:** User submits a prompt like "Create a view..." via the UI.
2.  **Orchestration:** The UI sends the prompt to the AI Agent Core's Orchestrator.
3.  **Schema Fetching:** The Orchestrator, via the Schema Manager and Database Interface, fetches relevant schema information from the Target Database.
4.  **LLM Interaction:** The Orchestrator uses the Prompt Manager to construct a detailed prompt (including user request and schema context) for the LLM Service, requesting SQL generation.
5.  **SQL Generation:** The LLM Service processes the prompt and returns the generated SQL query (e.g., `CREATE VIEW ...`).
6.  **Preview:** The Orchestrator sends the generated SQL back to the UI for user preview.
7.  **User Confirmation:** User reviews the SQL and clicks "Accept" in the UI.
8.  **Execution:** The UI signals acceptance to the Orchestrator. The Orchestrator passes the SQL query to the Database Interface for execution against the Target Database.
9.  **Feedback:** The Database Interface returns the execution status (success/error) to the Orchestrator, which relays the final confirmation or error message to the user via the UI.

### 4.3. Interaction Flow (Example: Workflow 2 - Debugging)

1.  **User Input:** User submits a prompt like "Why is the count in view X wrong..." via the UI.
2.  **Orchestration:** The UI sends the prompt to the AI Agent Core's Orchestrator.
3.  **Analysis Setup:** The Orchestrator activates the Debugging Analyzer. It identifies potentially relevant objects (view X, source tables) based on the prompt.
4.  **Information Gathering:** The Analyzer, through the Schema Manager and Database Interface, fetches the definition of view X and the structure/relevant data from source tables in the Target Database.
5.  **LLM Analysis/Comparison:** The Analyzer may structure the gathered information (view definition, sample data, user's issue description) and use the Prompt Manager to query the LLM Service for analysis, comparison, and identification of the discrepancy's cause.
6.  **Summary & Solution:** The LLM Service returns an analysis/summary. The Analyzer might also generate or ask the LLM to generate a potential SQL fix (e.g., `ALTER VIEW`).
7.  **Preview:** The Orchestrator sends the summary, potential fix, and any relevant data previews back to the UI.
8.  **User Confirmation:** User reviews the analysis and proposed fix, and decides whether to accept the fix.
9.  **Execution (Optional):** If the user accepts the fix, the UI signals acceptance. The Orchestrator passes the corrective SQL to the Database Interface for execution.
10. **Feedback:** The Database Interface returns the execution status, which the Orchestrator relays to the UI.
