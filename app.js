
import express from "express";
import pool from "./db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config";
import authenticateToken from "./authMiddleware.js";

const app = express();

app.use(express.json());

const PORT = 3000;

// Home route
app.get("/", (req, res) => {
    res.send("Task Management API is running");
});

// =========================
// USERS API
// =========================

// Get all users
app.get("/users", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, email FROM users ORDER BY id"
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Register a new user
app.post("/users", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }

        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, name, email`,
            [name, email, hashedPassword]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0]
        });
  
} catch (error) {
    console.error("Register user error:", error);

    if (error.code === "23505") {
        return res.status(409).json({
            message: "Email already exists"
        });
    }

    res.status(500).json({ message: "Server error" });
}
});

// Get one user
app.get("/users/:id", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, name, email FROM users WHERE id = $1",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update a user
app.patch("/users/:id", async (req, res) => {
    try {
        const { name, email } = req.body;

        if (name === undefined && email === undefined) {
            return res.status(400).json({
                message: "Provide name or email to update"
            });
        }

        const result = await pool.query(
            `UPDATE users
             SET name = COALESCE($1, name),
                 email = COALESCE($2, email)
             WHERE id = $3
             RETURNING id, name, email`,
            [name ?? null, email ?? null, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User updated successfully",
            user: result.rows[0]
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        res.status(500).json({ message: "Server error" });
    }
});

// Delete a user
app.delete("/users/:id", async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING id",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        if (error.code === "23503") {
            return res.status(409).json({
                message: "Cannot delete this user because related records exist"
            });
        }

        res.status(500).json({ message: "Server error" });
    }
});

// =========================
// PROJECTS API (PROTECTED)
// =========================

// Get all projects
app.get("/projects", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM projects ORDER BY id"
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Create a project
app.post("/projects", authenticateToken, async (req, res) => {
    try {
        const { name, description, user_id } = req.body;

        if (!name || !user_id) {
            return res.status(400).json({
                message: "Project name and user_id are required"
            });
        }

        const result = await pool.query(
            `INSERT INTO projects (name, description, user_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name, description ?? null, user_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === "23503") {
            return res.status(400).json({
                message: "The specified user does not exist"
            });
        }

        res.status(500).json({ message: "Server error" });
    }
});

// Get one project
app.get("/projects/:id", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM projects WHERE id = $1",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update a project
app.patch("/projects/:id", authenticateToken, async (req, res) => {
    try {
        const { name, description } = req.body;

        if (name === undefined && description === undefined) {
            return res.status(400).json({
                message: "Provide name or description to update"
            });
        }

        const result = await pool.query(
            `UPDATE projects
             SET name = COALESCE($1, name),
                 description = COALESCE($2, description)
             WHERE id = $3
             RETURNING *`,
            [name ?? null, description ?? null, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Delete a project
app.delete("/projects/:id", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM projects WHERE id = $1 RETURNING id",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        res.json({ message: "Project deleted successfully" });
    } catch (error) {
        if (error.code === "23503") {
            return res.status(409).json({
                message: "Cannot delete this project because tasks are linked to it"
            });
        }

        res.status(500).json({ message: "Server error" });
    }
});

// =========================
// TASKS API (PROTECTED)
// =========================

// Get tasks with pagination and sorting
app.get("/tasks", authenticateToken, async (req, res) => {
    try {
        const page = Number.parseInt(req.query.page, 10) || 1;
        const limit = Number.parseInt(req.query.limit, 10) || 5;
        const sort = req.query.sort === "desc" ? "DESC" : "ASC";

        if (
            !Number.isInteger(page) ||
            !Number.isInteger(limit) ||
            page < 1 ||
            limit < 1 ||
            limit > 100
        ) {
            return res.status(400).json({
                message: "Page must be at least 1 and limit must be between 1 and 100"
            });
        }

        const offset = (page - 1) * limit;

        const result = await pool.query(
            `SELECT * FROM tasks
             ORDER BY id ${sort}
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        res.json({
            page,
            limit,
            tasks: result.rows
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Create a task
app.post("/tasks", authenticateToken, async (req, res) => {
    try {
        const { title, description, status, project_id, due_date } = req.body;

        if (!title || !project_id) {
            return res.status(400).json({
                message: "Title and project_id are required"
            });
        }

        const taskStatus = status ?? "pending";

        if (!["pending", "in progress", "completed"].includes(taskStatus)) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const result = await pool.query(
            `INSERT INTO tasks
             (title, description, status, project_id, due_date)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                title,
                description ?? null,
                taskStatus,
                project_id,
                due_date ?? null
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === "23503") {
            return res.status(400).json({
                message: "The specified project does not exist"
            });
        }

        if (error.code === "22007" || error.code === "22008") {
            return res.status(400).json({
                message: "Invalid due_date"
            });
        }

        res.status(500).json({ message: "Server error" });
    }
});

// Get task details using JOIN
app.get("/tasks/details", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                tasks.id,
                tasks.title,
                tasks.description,
                tasks.status,
                tasks.due_date,
                projects.name AS project_name,
                users.name AS user_name
             FROM tasks
             JOIN projects ON tasks.project_id = projects.id
             JOIN users ON projects.user_id = users.id
             ORDER BY tasks.id`
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Search and filter tasks
app.get("/tasks/search", authenticateToken, async (req, res) => {
    try {
        const { title, status, overdue } = req.query;

        const conditions = [];
        const values = [];

        if (title) {
            values.push(`%${title}%`);
            conditions.push(`title ILIKE $${values.length}`);
        }

        if (status) {
            if (!["pending", "in progress", "completed"].includes(status)) {
                return res.status(400).json({
                    message: "Invalid status"
                });
            }

            values.push(status);
            conditions.push(`status = $${values.length}`);
        }

        if (overdue === "true") {
            conditions.push(
                "due_date < CURRENT_DATE AND status <> 'completed'"
            );
        }

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const result = await pool.query(
            `SELECT * FROM tasks ${whereClause} ORDER BY id`,
            values
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get overdue tasks
app.get("/tasks/overdue", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM tasks
             WHERE due_date < CURRENT_DATE
             AND status <> 'completed'
             ORDER BY due_date ASC`
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Get one task
app.get("/tasks/:id", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM tasks WHERE id = $1",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update a task
app.patch("/tasks/:id", authenticateToken, async (req, res) => {
    try {
        const { title, description, status, project_id, due_date } = req.body;

        if (
            title === undefined &&
            description === undefined &&
            status === undefined &&
            project_id === undefined &&
            due_date === undefined
        ) {
            return res.status(400).json({
                message: "Provide at least one field to update"
            });
        }

        if (
            status !== undefined &&
            !["pending", "in progress", "completed"].includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid status"
            });
        }

        const result = await pool.query(
            `UPDATE tasks
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 status = COALESCE($3, status),
                 project_id = COALESCE($4, project_id),
                 due_date = COALESCE($5, due_date)
             WHERE id = $6
             RETURNING *`,
            [
                title ?? null,
                description ?? null,
                status ?? null,
                project_id ?? null,
                due_date ?? null,
                req.params.id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task updated successfully",
            task: result.rows[0]
        });
    } catch (error) {
        if (error.code === "23503") {
            return res.status(400).json({
                message: "The specified project does not exist"
            });
        }

        res.status(500).json({ message: "Server error" });
    }
});

// Delete a task
app.delete("/tasks/:id", authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM tasks WHERE id = $1 RETURNING id",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// =========================
// DASHBOARD API
// =========================

app.get("/dashboard", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT
                COUNT(*) AS total_tasks,
                COUNT(*) FILTER (
                    WHERE status = 'completed'
                ) AS completed_tasks,
                COUNT(*) FILTER (
                    WHERE status <> 'completed'
                ) AS pending_tasks
             FROM tasks`
        );

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// =========================
// LOGIN API
// =========================

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0 || !result.rows[0].password) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});