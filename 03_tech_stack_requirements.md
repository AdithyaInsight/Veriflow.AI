## 3. Technical Stack and Requirements

This section outlines the proposed technical stack and key requirements for developing the Agentic AI database tool, particularly focusing on the Proof of Concept (POC) for the hackathon.

### 3.1. Proposed Technical Stack

*   **Core AI/LLM:** A powerful Large Language Model (LLM) capable of understanding natural language, reasoning about database schemas, and generating accurate SQL code. Options include models from OpenAI (GPT-4/GPT-3.5), Anthropic (Claude), or Google (Gemini).
*   **Agent Framework:** A framework to structure the agent's logic, manage interactions with the LLM, handle database connections, and orchestrate the workflows. LangChain or LlamaIndex are strong candidates, providing tools for prompt management, schema awareness, and tool usage.
*   **Programming Language:** Python is recommended due to its extensive libraries for AI/ML (like `transformers`, `langchain`), database connectivity, and web frameworks.
*   **Database Connectivity:** Standard Python libraries for database interaction based on the target database:
    *   For Azure SQL Database: `pyodbc` or `SQLAlchemy` with appropriate drivers.
    *   For Oracle Database: `cx_Oracle` or `SQLAlchemy`.
*   **Database Schema Access:** The agent will need mechanisms to dynamically fetch database metadata (table names, column names, data types, relationships) using SQL queries (e.g., `INFORMATION_SCHEMA` queries for SQL Server/Azure SQL, `ALL_TAB_COLUMNS`, `ALL_CONSTRAINTS` for Oracle).
*   **Backend API (Optional for POC, Recommended for Scalability):** A simple API built with Flask or FastAPI could serve as an interface between a potential frontend and the AI agent logic.
*   **Frontend (for POC):** A basic interface for user interaction. This could range from a simple Command-Line Interface (CLI) accepting text prompts to a minimal web interface (using Streamlit, Gradio, or basic HTML/JS with the backend API) for better visualization of previews and results.
*   **Target Databases:** As specified, the POC should aim to support either Azure SQL Database or Oracle Database. The design should ideally allow for relatively easy extension to other SQL-based databases.

### 3.2. Functional Requirements

*   **Natural Language Understanding:** The system must accurately interpret user prompts for both object creation and inconsistency debugging.
*   **Schema Awareness:** The agent must be able to dynamically query and understand the schema of the connected database.
*   **SQL Generation:** The agent must generate syntactically correct and logically sound SQL queries (DDL for creation, DML/Query for analysis and debugging) based on user prompts and schema.
*   **Query Preview:** The system must display the generated SQL to the user before execution.
*   **Execution Control:** The system must only execute generated SQL against the database upon explicit user acceptance.
*   **Database Interaction:** The system must securely connect to the target database (Azure SQL or Oracle), execute queries, and fetch results/metadata.
*   **Error Handling:** The system must gracefully handle errors during SQL generation, database connection, or query execution and report them to the user.
*   **Discrepancy Analysis (Workflow 2):** The agent must be able to fetch relevant data, compare logic and results from different objects (e.g., view vs. base tables), and identify potential causes for inconsistencies.
*   **Result Summarization:** The agent must provide clear, concise summaries of its findings, especially during the debugging workflow.

### 3.3. Non-Functional Requirements (Considerations for POC)

*   **Security:** Database credentials must be handled securely (e.g., environment variables, configuration files, secrets management – avoid hardcoding). The agent's permissions within the database should be limited to necessary actions (least privilege principle).
*   **Performance:** While deep optimization might be out of scope for a hackathon, the agent should respond within a reasonable timeframe. Query generation and analysis should be efficient enough for typical use cases.
*   **Accuracy:** The generated SQL and inconsistency analysis must be highly accurate to be useful and trustworthy.
*   **Usability (POC):** The interface (CLI or basic UI) should be simple and intuitive for users to input prompts and review results/previews.
