import pool from "./db.js";

pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL
    )
`, (error, result) => {
    if (error) {
        console.log("Users table creation failed", error);
    } else {
        console.log("Users table created successfully");
    }
});

pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`, (error, result) => {
    if (error) {
        console.log("Projects table creation failed", error);
    } else {
        console.log("Projects table created successfully");
    }
});

pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        project_id INTEGER NOT NULL,
        FOREIGN KEY (project_id) REFERENCES projects(id)
    )
`, (error, result) => {
    if (error) {
        console.log("Tasks table creation failed", error);
    } else {
        console.log("Tasks table created successfully");
    }
});


pool.query(`
    ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS due_date DATE
`, (error, result) => {
    if (error) {
        console.log("Error adding due_date column", error);
    } else {
        console.log("due_date column added successfully");
    }

    pool.end();
});


pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password VARCHAR(255)
`, (error, result) => {
    if (error) {
        console.log("Error adding password column", error);
    } else {
        console.log("Password column added successfully");
    }

    pool.end();
});