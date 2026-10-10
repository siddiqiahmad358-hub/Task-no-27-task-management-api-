# Task Management REST API

A REST API built using Node.js, Express.js, and PostgreSQL to manage users, projects, and tasks.

## Technologies Used

* Node.js
* Express.js
* PostgreSQL
* JSON Web Tokens (JWT) for authentication
* bcryptjs for password hashing
* Postman for API testing

## Features

* User registration and login
* Password hashing
* JWT-based authentication
* Create, read, update, and delete operations for users, projects, and tasks
* Task search and status filtering
* Pagination and sorting for tasks
* Overdue task filtering
* JOIN queries for task, project, and user details
* Dashboard statistics
* Input validation and error handling

## Requirements

* Node.js and npm
* PostgreSQL
* Postman (for API testing)

## Setup Instructions

1. Clone or download this repository.

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a PostgreSQL database named `task_management`.

4. Create a `.env` file in the project root and configure the required environment variables.

5. Ensure the PostgreSQL connection settings in `db.js` use your local database configuration.

6. Run the database setup script:

   ```bash
   node setupDatabase.js
   ```

7. Start the server using the start command configured in `package.json`, or run:

   ```bash
   node app.js
   ```

8. The API runs at `http://localhost:3000`.

## Authentication

Register a user and log in through `POST /login` to receive a JWT. Use the token as a Bearer Token when calling protected endpoints.

## Main API Endpoints

| Method | Endpoint         | Purpose                               |
| ------ | ---------------- | ------------------------------------- |
| GET    | `/`              | Check server                          |
| POST   | `/users`         | Register a user                       |
| GET    | `/users`         | Get users                             |
| POST   | `/login`         | Log in                                |
| GET    | `/projects`      | Get projects                          |
| POST   | `/projects`      | Create a project                      |
| GET    | `/tasks`         | Get tasks with pagination and sorting |
| POST   | `/tasks`         | Create a task                         |
| GET    | `/tasks/details` | Get task details using JOINs          |
| GET    | `/tasks/search`  | Search and filter tasks               |
| GET    | `/tasks/overdue` | Get overdue tasks                     |
| GET    | `/dashboard`     | Get dashboard statistics              |

Some endpoints require authentication. Refer to the source code for the complete list of routes and supported request fields.

## API Testing

Import `Task Management API.postman_collection.json` into Postman to access the saved API requests. Start the server and ensure the database is configured before running the requests.

## Security

Environment variables and database credentials must be configured locally. Do not commit `.env`, passwords, JWT secrets, or other sensitive credentials to GitHub.
