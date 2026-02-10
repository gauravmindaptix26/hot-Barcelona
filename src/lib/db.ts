import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not set");
}

const globalForMongo = globalThis as typeof globalThis & {
  _mongoClient?: MongoClient;
};

const client = globalForMongo._mongoClient ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalForMongo._mongoClient = client;
}

export async function getDb() {
  await client.connect();
  const dbName = process.env.MONGODB_DB ?? "hot_barcelona";
  return client.db(dbName);
}
