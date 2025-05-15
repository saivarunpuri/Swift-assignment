# Node Assignment API

A simple Node.js REST API server using TypeScript and MongoDB.

It fetches dummy data from [JSONPlaceholder](https://jsonplaceholder.typicode.com/) and stores it into MongoDB collections. The API supports basic CRUD operations on users, with posts and comments linked to users.

---

## Features

* Fetch and load 10 users with their posts and comments from JSONPlaceholder into MongoDB
* Retrieve user details with nested posts and comments
* Delete all users or a specific user
* Add a new user
* Uses only native Node.js HTTP module, TypeScript, and official MongoDB driver

---

## Project Structure

```
src/
 ├── controllers/
 │    └── userController.ts       # Business logic for API endpoints
 ├── models/
 │    ├── db.ts                   # MongoDB connection setup
 │    └── user.ts                 # TypeScript interfaces for User, Post, Comment
 ├── routes/
 │    └── userRoutes.ts           # Route handlers for users API
 └── server.ts                     # Server entry point, routing setup
package.json                     # Project dependencies (typescript, mongodb)
tsconfig.json                   # TypeScript configuration
postman_collection.json         # Postman API requests for testing
README.md                       # This file
```

---

## Installation

1. Clone or download the repository

2. Install dependencies

```bash
npm install
```

3. Start your local MongoDB server on default port 27017

4. Run the server with:

```bash
npx ts-node src/index.ts
```

---

## API Endpoints

| Method | URL              | Description                                                   |
| ------ | ---------------- | ------------------------------------------------------------- |
| GET    | `/load`          | Load 10 users, their posts, and comments from JSONPlaceholder |
| GET    | `/users/:userId` | Get a user by ID including their posts and comments           |
| DELETE | `/users`         | Delete all users                                              |
| DELETE | `/users/:userId` | Delete user by ID                                             |
| PUT    | `/users`         | Add a new user (user data in request body)                    |

---

### Notes

* For `PUT /users`, the user ID must be unique; otherwise, an error is returned.
* Responses use appropriate HTTP status codes:

  * `200 OK` for successful GET and PUT
  * `204 No Content` for successful DELETE with no response body
  * `400 Bad Request` for invalid inputs
  * `404 Not Found` if user does not exist
  * `409 Conflict` if adding a user that already exists
  * `500 Internal Server Error` for server issues

---

## Technologies Used

* Node.js (HTTP module)
* TypeScript
* MongoDB (native driver)
* JSONPlaceholder API for dummy data

---

