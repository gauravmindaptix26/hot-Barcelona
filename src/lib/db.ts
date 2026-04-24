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
let indexesPromise: Promise<void> | undefined;

if (process.env.NODE_ENV !== "production") {
  globalForMongo._mongoClient = client;
  globalForMongo._mongoClientPromise = clientPromise;
}

export async function getDb() {
  await clientPromise;
  const dbName = process.env.MONGODB_DB ?? "hot_barcelona";
  const db = client.db(dbName);

  indexesPromise ??= db.collection("users").createIndex(
    { nameKey: 1 },
    {
      name: "users_nameKey_unique",
      unique: true,
      partialFilterExpression: { nameKey: { $type: "string" } },
    }
  ).then(() => undefined);

  await indexesPromise;
  return db;
}
