import { MongoClient, Db } from "mongodb";

const MONGO_URI = process.env.MONGO_URI|| "mongodb://127.0.0.1:27017";
const DB_NAME = "swift-assignment";

const client = new MongoClient(MONGO_URI);
let db: Db;

export async function connectToDB() {
  if (!db) {
    await client.connect();
    db = client.db(DB_NAME);
    console.log("✅ Connected to MongoDB");
  }
  return db;
}

export function getDB() {
  if (!db) {
    throw new Error("Database not initialized. Call connectToDB first.");
  }
  return db;
}
