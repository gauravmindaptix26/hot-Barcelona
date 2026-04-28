import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI is not set");
}

const globalForMongo = globalThis as typeof globalThis & {
  _mongoClient?: MongoClient;
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoUsersIndexPromise?: Promise<void>;
};

const client = globalForMongo._mongoClient ?? new MongoClient(uri);
const clientPromise =
  globalForMongo._mongoClientPromise ?? client.connect().then(() => client);

if (process.env.NODE_ENV !== "production") {
  globalForMongo._mongoClient = client;
  globalForMongo._mongoClientPromise = clientPromise;
}

export function ensureUsersIndexes() {
  globalForMongo._mongoUsersIndexPromise ??= (async () => {
    try {
      await clientPromise;
      const dbName = process.env.MONGODB_DB ?? "hot_barcelona";
      const db = client.db(dbName);
      await db.collection("users").createIndex(
        { nameKey: 1 },
        {
          name: "users_nameKey_unique",
          unique: true,
          partialFilterExpression: { nameKey: { $type: "string" } },
        }
      );
    } catch (error) {
      globalForMongo._mongoUsersIndexPromise = undefined;
      console.error("[db] Failed to ensure users indexes:", error);
    }
  })();

  return globalForMongo._mongoUsersIndexPromise;
}

export async function getDb() {
  await clientPromise;
  const dbName = process.env.MONGODB_DB ?? "hot_barcelona";
  const db = client.db(dbName);
  return db;
}
