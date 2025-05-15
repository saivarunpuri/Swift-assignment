import https from "https";
import { IncomingMessage, ServerResponse } from "http";
import { getDB } from "../models/db";
import { User, Post, Comment } from "../models/user";

function fetchJSON(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (resp) => {
      let data = "";
      resp.on("data", (chunk) => (data += chunk));
      resp.on("end", () => resolve(JSON.parse(data)));
      resp.on("error", reject);
    });
  });
}

export async function loadData(res: ServerResponse) {
  try {
    const db = getDB();

    const users: User[] = await fetchJSON("https://jsonplaceholder.typicode.com/users?_limit=10");
    const posts: Post[] = await fetchJSON("https://jsonplaceholder.typicode.com/posts");
    const comments: Comment[] = await fetchJSON("https://jsonplaceholder.typicode.com/comments");

    // Clear existing data
    await db.collection("users").deleteMany({});
    await db.collection("posts").deleteMany({});
    await db.collection("comments").deleteMany({});

    // Insert fresh data
    await db.collection("users").insertMany(users);

    const userIds = users.map((u) => u.id);
    const userPosts = posts.filter((p) => userIds.includes(p.userId));
    await db.collection("posts").insertMany(userPosts);

    const postIds = userPosts.map((p) => p.id);
    const postComments = comments.filter((c) => postIds.includes(c.postId));
    await db.collection("comments").insertMany(postComments);

    res.writeHead(200);
    res.end();
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: "Failed to load data" }));
  }
}

export async function getUser(userId: number, res: ServerResponse) {
  try {
    const db = getDB();

    const user = await db.collection<User>("users").findOne({ id: userId });
    if (!user) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found" }));
      return;
    }

    const posts = await db.collection<Post>("posts").find({ userId }).toArray();

    const postIds = posts.map((p) => p.id);
    const comments = await db.collection<Comment>("comments").find({ postId: { $in: postIds } }).toArray();

    const postsWithComments = posts.map((post) => ({
      ...post,
      comments: comments.filter((c) => c.postId === post.id),
    }));

    const response = { ...user, posts: postsWithComments };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response));
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: "Failed to get user" }));
  }
}

export async function getUsers(req: IncomingMessage, res: ServerResponse) {
  try {
    const db = getDB();
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Sorting support
    const sortParam = url.searchParams.get("sort") || "";
    let sort: { [key: string]: 1 | -1 } = {};
    if (sortParam === "name_asc") sort = { name: 1 };
    else if (sortParam === "name_desc") sort = { name: -1 };

    const users = await db
      .collection<User>("users")
      .find({})
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));
  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: "Failed to fetch users" }));
  }
}

export async function deleteAllUsers(res: ServerResponse) {
  try {
    const db = getDB();
    await db.collection("users").deleteMany({});
    await db.collection("posts").deleteMany({});
    await db.collection("comments").deleteMany({});

    res.writeHead(204); // No Content
    res.end();
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: "Failed to delete users" }));
  }
}

export async function deleteUserById(userId: number, res: ServerResponse) {
  try {
    const db = getDB();

    const user = await db.collection<User>("users").findOne({ id: userId });
    if (!user) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "User not found" }));
      return;
    }

    // Delete user's posts and their comments
    const userPosts = await db.collection<Post>("posts").find({ userId }).toArray();
    const postIds = userPosts.map((p) => p.id);

    await db.collection("users").deleteOne({ id: userId });
    await db.collection("posts").deleteMany({ userId });
    await db.collection("comments").deleteMany({ postId: { $in: postIds } });

    res.writeHead(204); // No Content
    res.end();
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: "Failed to delete user" }));
  }
}

export async function putUser(newUser: User, res: ServerResponse) {
  try {
    const db = getDB();

    const existingUser = await db.collection<User>("users").findOne({ id: newUser.id });
    if (existingUser) {
      res.writeHead(409, { "Content-Type": "application/json" }); // Conflict
      res.end(JSON.stringify({ error: "User already exists" }));
      return;
    }

    await db.collection("users").insertOne(newUser);

    res.writeHead(201, { "Content-Type": "application/json", Location: `/users/${newUser.id}` });
    res.end(JSON.stringify(newUser));
  } catch (error) {
    console.error(error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: "Failed to add user" }));
  }
}
