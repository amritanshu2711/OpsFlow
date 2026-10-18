# OpsFlow — Task Management System

OpsFlow is a task management application built as part of the Newtonite OpsFlow Software Engineering Challenge. It helps users organize tasks, set priorities, track progress, and manage work through a Kanban board.

## Features

- **Task Management:** Create, view, update, and delete tasks.
- **Kanban Board:** Organize tasks into To Do, In Progress, and Done columns.
- **Task Priorities:** Assign Low, Medium, or High priority to each task.
- **Search:** Search tasks by title or description.
- **Filtering:** Filter tasks by their current status.
- **Sorting:** Sort tasks by creation date, priority, or title.
- **REST API:** Backend endpoints for task operations.
- **Input Validation:** Validate task titles and other request data.
- **Error Handling:** Return structured error responses for API errors.
- **Optimistic Locking:** Detect conflicting task updates using version numbers.
- **Automated Tests:** Test important API operations and error scenarios.
- **API Documentation:** Explore endpoints using Swagger UI.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, JavaScript, CSS |
| Backend | Java 25, Spring Boot |
| Database | PostgreSQL |
| Data Access | Spring Data JPA, Hibernate |
| API | REST API |
| API Documentation | OpenAPI, Swagger UI |
| Testing | JUnit, Spring Boot Test, MockMvc |
| Build Tool | Maven |
| Version Control | Git and GitHub |

## Project Structure

```text
OpsFlow/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/opsflow/backend/
│   │   │   └── resources/
│   │   └── test/
│   ├── mvnw
│   ├── mvnw.cmd
│   └── pom.xml
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the project:

- Java Development Kit (JDK) 25
- PostgreSQL
- Node.js and npm
- Git

The backend uses Maven Wrapper, so a separate Maven installation is generally not required.

## Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/amritanshu2711/OpsFlow.git
cd OpsFlow
```

### 2. Configure PostgreSQL

Start PostgreSQL and create the database if it does not already exist.

```sql
CREATE DATABASE opsflow;
```

The application uses the following database settings:

- Database: `opsflow`
- Username: `postgres`
- Host: `localhost`
- Port: `5432`

Update these settings in `backend/src/main/resources/application.properties` if your local PostgreSQL configuration differs.

### 3. Configure the database password

The application reads the database password from the `DB_PASSWORD` environment variable.

On Windows Command Prompt, run the following command in the terminal where you will start the backend:

```cmd
set "DB_PASSWORD=YOUR_POSTGRES_PASSWORD"
```

Replace `YOUR_POSTGRES_PASSWORD` with your actual local PostgreSQL password. Do not commit your password to GitHub.

### 4. Start the backend

Open a terminal and run:

```cmd
cd backend
mvnw.cmd spring-boot:run
```

The Spring Boot backend starts at:

`http://localhost:8080`

Keep this terminal running.

### 5. Start the frontend

Open a second terminal from the project root:

```cmd
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

`http://localhost:5173`

Keep the frontend terminal running as well.

## API Documentation

Once the backend is running, open Swagger UI:

`http://localhost:8080/swagger-ui.html`

The OpenAPI specification is available at:

`http://localhost:8080/v3/api-docs`

## REST API Endpoints

Base URL: `http://localhost:8080/api/tasks`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Retrieve all tasks |
| GET | `/api/tasks/{id}` | Retrieve a task by ID |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |

### Example: Create a task

```json
{
  "title": "Prepare project report",
  "description": "Complete the project documentation",
  "status": "TODO",
  "priority": "HIGH"
}
```

Valid task statuses:

- `TODO`
- `IN_PROGRESS`
- `DONE`

Valid priorities:

- `LOW`
- `MEDIUM`
- `HIGH`

## Running Automated Tests

Open a terminal and run:

```cmd
cd backend
mvnw.cmd clean test
```

The automated tests cover task retrieval, creation, validation, missing tasks, updates, conflicting updates, and deletion.

The project tests have previously completed successfully with **8 tests and zero failures or errors**. Run the command again to verify the current checkout.

## Configuration and Security

- Database credentials are supplied through the `DB_PASSWORD` environment variable.
- Local environment files, build output, dependencies, and logs are excluded through `.gitignore`.
- Do not publish passwords, access tokens, or other secrets.
- For production deployment, use appropriate database permissions, secure environment configuration, and HTTPS.

## Future Improvements

- User authentication and role-based access control
- Team collaboration and task assignment
- Drag-and-drop task movement
- Pagination for large task lists
- Deployment to a cloud platform
- Continuous integration with automated test execution

## Repository

GitHub: https://github.com/amritanshu2711/OpsFlow

---

**OpsFlow — Organize work. Keep momentum.**