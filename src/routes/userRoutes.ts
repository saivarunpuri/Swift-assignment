import { IncomingMessage, ServerResponse } from "http";
import { loadData, getUser, deleteAllUsers, deleteUserById, putUser } from "../controllers/userController";

export async function handleUserRoutes(req: IncomingMessage, res: ServerResponse) {
  const url = req.url || "";
  const method = req.method || "";

  if (method === "GET" && url === "/load") {
    await loadData(res);
    return;
  }

  if (method === "GET" && url.startsWith("/users/")) {
    const userId = parseInt(url.split("/")[2], 10);
    if (isNaN(userId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid userId" }));
      return;
    }
    await getUser(userId, res);
    return;
  }

  if (method === "DELETE" && url === "/users") {
    await deleteAllUsers(res);
    return;
  }

  if (method === "DELETE" && url.startsWith("/users/")) {
    const userId = parseInt(url.split("/")[2], 10);
    if (isNaN(userId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid userId" }));
      return;
    }
    await deleteUserById(userId, res);
    return;
  }

  if (method === "PUT" && url === "/users") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", async () => {
      try {
        const userData = JSON.parse(body);

        // Validate userData shape minimally here or inside putUser
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
