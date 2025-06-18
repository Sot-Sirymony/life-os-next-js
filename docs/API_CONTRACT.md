# Life OS API Contract

This document outlines the API contract for the Life OS application. This contract should be followed by both the current Next.js API and the future Spring Boot implementation.

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Goals API

### Get All Goals
```http
GET /goals
```
Response:
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string | null",
    "category": "string",
    "status": "string",
    "progress": "number",
    "userId": "string",
    "tasks": [
      {
        "id": "string",
        "title": "string",
        "description": "string | null",
        "status": "string",
        "priority": "string",
        "timeEstimate": "number | null",
        "tools": "string | null",
        "aiIntegration": "boolean",
        "optimizationSuggestions": "string | null",
        "scheduledTime": "string | null",
        "goalId": "string | null",
        "userId": "string"
      }
    ],
    "createdAt": "string",
    "updatedAt": "string"
  }
]
```

### Create Goal
```http
POST /goals
```
Request Body:
```json
{
  "title": "string",
  "description": "string | null",
  "category": "string",
  "status": "string",
  "progress": "number"
}
```

### Update Goal
```http
PUT /goals
```
Request Body:
```json
{
  "id": "string",
  "title": "string",
  "description": "string | null",
  "category": "string",
  "status": "string",
  "progress": "number"
}
```

### Delete Goal
```http
DELETE /goals
```
Request Body:
```json
{
  "id": "string"
}
```

## Tasks API

### Get All Tasks
```http
GET /tasks
```
Response:
```json
[
  {
    "id": "string",
    "title": "string",
    "description": "string | null",
    "status": "string",
    "priority": "string",
    "timeEstimate": "number | null",
    "tools": "string | null",
    "aiIntegration": "boolean",
    "optimizationSuggestions": "string | null",
    "scheduledTime": "string | null",
    "goalId": "string | null",
    "userId": "string",
    "goal": {
      "id": "string",
      "title": "string",
      "description": "string | null",
      "category": "string",
      "status": "string",
      "progress": "number"
    }
  }
]
```

### Create Task
```http
POST /tasks
```
Request Body:
```json
{
  "title": "string",
  "description": "string | null",
  "status": "string",
  "priority": "string",
  "timeEstimate": "number | null",
  "tools": "string | null",
  "aiIntegration": "boolean",
  "optimizationSuggestions": "string | null",
  "scheduledTime": "string | null",
  "goalId": "string | null"
}
```

### Update Task
```http
PUT /tasks
```
Request Body:
```json
{
  "id": "string",
  "title": "string",
  "description": "string | null",
  "status": "string",
  "priority": "string",
  "timeEstimate": "number | null",
  "tools": "string | null",
  "aiIntegration": "boolean",
  "optimizationSuggestions": "string | null",
  "scheduledTime": "string | null",
  "goalId": "string | null"
}
```

### Delete Task
```http
DELETE /tasks
```
Request Body:
```json
{
  "id": "string"
}
```

## Error Responses
All endpoints may return the following error responses:

```json
{
  "error": "string"
}
```

Status codes:
- 200: Success
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

## Data Types
- `string`: Text data
- `number`: Numeric data
- `boolean`: True/false values
- `null`: Optional fields
- `string | null`: Optional string fields
- `number | null`: Optional number fields 