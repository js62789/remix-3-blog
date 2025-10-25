import { LocalFileStorage } from "@remix-run/file-storage/local";

interface User {
  id: string;
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt?: Date;
}

const usersStorage = new LocalFileStorage("./data/users");

export async function getAllUsers() {
  const { files } = await usersStorage.list();

  return Promise.all(files.map(async ({ key }) => {
    // Get the file
    const file = await usersStorage.get(key);
    // Read the file contents as JSON
    const user = JSON.parse(await file!.text()) as User;
    user.createdAt = new Date(user.createdAt!);
    return user;
  }));
}

async function createUserId() {
  const id = Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  const users = await getAllUsers();

  // Ensure the ID is unique
  if (users.find((user) => user.id === id)) {
    return createUserId();
  }

  return id;
}

export async function createUser(
  email: string,
  password: string,
  role: "user" | "admin" = "user",
) {
  const user: User = {
    id: await createUserId(),
    email,
    password,
    role,
    createdAt: new Date(),
  };

  await usersStorage.set(
    user.id,
    new File([JSON.stringify(user, null, 2)], `${user.id}.json`, {
      type: "application/json",
    }),
  );

  return user;
}
