import { createServer, IncomingMessage, ServerResponse } from "http";
import { connectToDB } from "./models/db";
import { handleUserRoutes } from "./routes/userRoutes";

const PORT = 3000;

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = req.url || "";
  const method = req.method || "";

  if (url === "/" && method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Welcome to Swift Assignment API" }));
    return;
  }

  if (url.startsWith("/load") || url.startsWith("/users")) {
    await handleUserRoutes(req, res);
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(PORT, async () => {
  await connectToDB();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
