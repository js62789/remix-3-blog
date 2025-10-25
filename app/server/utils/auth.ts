import { updateSession } from "../middleware/session.ts";
import { getAllUsers } from "../models/users.ts";

declare module "../middleware/session.ts" {
  interface SessionData {
    user?: {
      id: string;
      role: "user" | "admin";
    };
  }
}

export async function authenticate(email: string, password: string) {
  const users = await getAllUsers();

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = users.find(
    (user) => user.email === email && user.password === password,
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  return updateSession({ data: { user: { id: user.id, role: user.role } } });
}

export function logout() {
  return updateSession({ data: { user: undefined } });
}
