import { IncomingMessage, ServerResponse } from "http";
import {
  loadData,
  getUser,
  getUsers,
  deleteAllUsers,
  deleteUserById,
  putUser,
} from "../controllers/userController";

export async function handleUserRoutes(req: IncomingMessage, res: ServerResponse) {
  const url = req.url || "";
  const method = req.method || "";

  // Parse full URL to handle query parameters
  const urlObj = new URL(url, `http://${req.headers.host}`);

  if (method === "GET" && urlObj.pathname === "/load") {
    await loadData(res);
    return;
  }

  // Handle GET /users with pagination & sorting
  if (method === "GET" && urlObj.pathname === "/users") {
    await getUsers(req, res);
    return;
  }

  if (method === "GET" && urlObj.pathname.startsWith("/users/")) {
    const userId = parseInt(urlObj.pathname.split("/")[2], 10);
    if (isNaN(userId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid userId" }));
      return;
    }
    await getUser(userId, res);
    return;
  }

  if (method === "DELETE" && urlObj.pathname === "/users") {
    await deleteAllUsers(res);
    return;
  }

  if (method === "DELETE" && urlObj.pathname.startsWith("/users/")) {
    const userId = parseInt(urlObj.pathname.split("/")[2], 10);
    if (isNaN(userId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid userId" }));
      return;
    }
    await deleteUserById(userId, res);
    return;
  }

  if (method === "PUT" && urlObj.pathname === "/users") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      try {
        const userData = JSON.parse(body);

        if (!userData.id) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "User ID is required" }));
          return;
        }

        await putUser(userData, res);
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON body" }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Route not found" }));
}
