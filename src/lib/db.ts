import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not set");
}

const globalForMongo = globalThis as typeof globalThis & {
  _mongoClient?: MongoClient;
  _mongoClientPromise?: Promise<MongoClient>;
};

const client = globalForMongo._mongoClient ?? new MongoClient(uri);
const clientPromise =
  globalForMongo._mongoClientPromise ?? client.connect().then(() => client);

if (process.env.NODE_ENV !== "production") {
  globalForMongo._mongoClient = client;
  globalForMongo._mongoClientPromise = clientPromise;
}

export async function getDb() {
  await clientPromise;
  const dbName = process.env.MONGODB_DB ?? "hot_barcelona";
  return client.db(dbName);
}
