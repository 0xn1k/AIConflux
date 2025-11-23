import clientPromise from "./mongodb";

export async function getDatabase() {
  const client = await clientPromise;
  return client.db("aiconflux");
}

export async function getUsersCollection() {
  const db = await getDatabase();
  return db.collection("users");
}

export async function getChatsCollection() {
  const db = await getDatabase();
  return db.collection("chats");
}

export async function getPaymentsCollection() {
  const db = await getDatabase();
  return db.collection("payments");
}
