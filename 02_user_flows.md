## 2. User Flows and Workflows

This section details the step-by-step user interactions and system processes for the two core workflows of the Agentic AI database tool.

### Workflow 1: AI-Powered Database Object Creation

This workflow enables users to create database objects like views or tables using natural language prompts.

1.  **User Input:** The user initiates the process by providing a natural language prompt describing the desired database object. 
    *   *Example Prompt:* "Create a view named `active_customer_summary` that shows the customer ID, name, email, and total order value for customers who have placed an order in the last 6 months from the `customers` and `orders` tables."
2.  **AI Prompt Processing:** The AI agent receives the prompt and parses it to understand the user's intent, identifying the desired object type (view), name (`active_customer_summary`), required data fields (customer ID, name, email, total order value), source tables (`customers`, `orders`), and filtering conditions (orders in the last 6 months).
3.  **Schema Analysis:** The AI agent accesses the database metadata (schema) to understand the structure of the referenced base tables (`customers`, `orders`), including column names, data types, and relationships (keys).
4.  **Query Generation:** Based on the processed prompt and schema understanding, the AI agent constructs the appropriate SQL query. 
    *   *Example Generated SQL:* 
    ```sql
    CREATE VIEW active_customer_summary AS
    SELECT 
        c.customer_id, 
        c.name, 
        c.email, 
        SUM(o.order_value) AS total_order_value
    FROM 
        customers c
    JOIN 
        orders o ON c.customer_id = o.customer_id
    WHERE 
        o.order_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
    GROUP BY 
        c.customer_id, c.name, c.email;
    ```
5.  **Preview Presentation:** The AI agent presents the generated SQL query to the user for review. It may also provide a preview of the expected view structure (columns and data types) or even sample data queried from the potential view (if feasible and safe).
6.  **User Review & Decision:** The user examines the generated SQL query and the preview to ensure it matches their requirements. The user then chooses to either accept or reject the proposed creation.
7.  **Execution (on Acceptance):** If the user accepts, the AI agent connects to the target database environment and executes the generated `CREATE VIEW` (or `CREATE TABLE`, etc.) statement.
8.  **Confirmation/Error Reporting:** The AI agent monitors the execution result. 
    *   If successful, it confirms to the user that the object (`active_customer_summary` view) has been created.
    *   If an error occurs during execution (e.g., syntax error, permission issue), it reports the error message back to the user.

### Workflow 2: AI-Driven Data Inconsistency Debugging

This workflow assists users in diagnosing and potentially fixing data discrepancies within the database.

1.  **User Input:** The user describes a data inconsistency issue they are encountering using natural language.
    *   *Example Prompt:* "The total count of users in the `daily_active_users` view for yesterday seems lower than expected. It doesn't match the raw count from the `user_logins` table for the same day. Can you investigate why?"
2.  **AI Prompt Processing:** The AI agent parses the prompt to understand the problem: identify the objects involved (`daily_active_users` view, `user_logins` table), the nature of the discrepancy (count mismatch), and the relevant time frame (yesterday).
3.  **Object Identification & Analysis:** The AI agent identifies all relevant database objects. This includes fetching the definition (SQL query) of the `daily_active_users` view and understanding the structure of the `user_logins` table.
4.  **Data Fetching:** The agent executes queries to fetch relevant data segments from both the view and the base table for the specified period (yesterday). For instance, it might query `SELECT COUNT(*) FROM daily_active_users WHERE date = 'yesterday'` and `SELECT COUNT(DISTINCT user_id) FROM user_logins WHERE login_timestamp >= 'yesterday_start' AND login_timestamp < 'today_start'`.
5.  **Discrepancy Analysis:** The AI agent compares the view's definition (SQL logic) and the fetched data against the data from the base table(s). It looks for potential causes like incorrect join conditions, flawed filtering logic in the view definition, data type mismatches, missing data in source tables, or aggregation errors.
6.  **Summary Generation:** The agent synthesizes its findings into a clear, concise summary explaining the likely root cause of the inconsistency.
    *   *Example Summary:* "The discrepancy occurs because the `daily_active_users` view filters out users with a 'suspended' status, while your comparison query on `user_logins` includes all users regardless of status. Yesterday, 5 users who logged in had a 'suspended' status, leading to the count difference."
7.  **Solution Proposal:** Based on the analysis, the AI agent proposes potential solutions. This might involve suggesting modifications to the view's SQL query or highlighting the specific logic causing the difference.
    *   *Example Proposed Fix (if modification is desired):* "To include suspended users in the view count, the `WHERE` clause in the `daily_active_users` view definition needs to be adjusted. Proposed updated query: [Shows modified SQL query removing the status filter]"
8.  **Preview Presentation:** The agent presents the summary, the proposed SQL fix (if applicable), and potentially a preview of the data if the fix were applied (e.g., the recalculated count).
9.  **User Review & Decision:** The user reviews the explanation, the proposed fix, and the preview. They decide whether to accept the proposed changes, reject them, or perhaps just use the information provided for manual adjustments.
10. **Execution (on Acceptance):** If the user accepts a proposed SQL modification (e.g., `ALTER VIEW`), the AI agent executes the corrective query against the database.
11. **Confirmation/Error Reporting:** The agent confirms whether the update was successful or reports any errors encountered during execution.
