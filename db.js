import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "task_management",
    password: process.env.DB_PASSWORD,
    port: 5432
});

export default pool;