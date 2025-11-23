import { DEFAULT_FREE_MODELS, INITIAL_TOKENS } from "@/lib/constants";

export interface User {
  _id?: string;
  email: string;
  name?: string;
  image?: string;
  freeChatsUsed: number;
  tokens: number;
  unlockedModels: string[];
  createdAt: Date;
  updatedAt: Date;
}

export async function getUserOrCreate(
  email: string,
  name?: string,
  image?: string
): Promise<User> {
  const { getUsersCollection } = await import("@/lib/db");
  const users = await getUsersCollection();

  let user = await users.findOne({ email });

  if (!user) {
    const newUser: Omit<User, "_id"> = {
      email,
      name: name || "",
      image: image || "",
      freeChatsUsed: 0,
      tokens: INITIAL_TOKENS,
      unlockedModels: DEFAULT_FREE_MODELS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await users.insertOne(newUser as any);
    const insertedUser: User = { ...newUser, _id: result.insertedId.toString() as any };
    return insertedUser;
  }

  // For existing users, ensure all free models (including Gemini) are unlocked
  const unlockedModels = (user.unlockedModels as string[]) || [];
  const missingFreeModels = DEFAULT_FREE_MODELS.filter(m => !unlockedModels.includes(m));

  if (missingFreeModels.length > 0) {
    const updatedUnlockedModels = [...unlockedModels, ...missingFreeModels];
    await users.updateOne(
      { email },
      { $set: { unlockedModels: updatedUnlockedModels } }
    );
    user.unlockedModels = updatedUnlockedModels as any;
  }

  return user as User;
}

export async function getUser(email: string): Promise<User | null> {
  const { getUsersCollection } = await import("@/lib/db");
  const users = await getUsersCollection();
  return users.findOne({ email }) as Promise<User | null>;
}

export async function updateUser(
  email: string,
  update: Partial<User>
): Promise<void> {
  const { getUsersCollection } = await import("@/lib/db");
  const users = await getUsersCollection();
  await users.updateOne(
    { email },
    { $set: { ...update, updatedAt: new Date() } }
  );
}
