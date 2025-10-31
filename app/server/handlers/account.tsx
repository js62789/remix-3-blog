import { Layout } from "../components/Layout.tsx";
import Header from "../components/Header.tsx";
import { render } from "../utils/render.ts";
import { getAllUsers, getUserById } from "../models/users.ts";
import { getUserId } from "../middleware/session.ts";
import { getSession } from "../middleware/session.ts";
import Container from "../components/Container.tsx";

export default async function Account() {
  const userId = await getUserId();

  if (!userId) {
    console.log("No user ID found in session", getSession());
    return new Response("Unauthorized", { status: 401 });
  }

  const user = await getUserById(userId);

  if (!user) {
    console.log("No user found", getSession(), await getAllUsers());
    return new Response("Unauthorized", { status: 401 });
  }

  return render(
    <Layout>
      <Header />
      <Container>
        <h1>My Account</h1>
        <label>Email:</label>
        <input type="email" value={user.email} readOnly />
        <label>Role:</label>
        <input type="text" value={user.role} readOnly />
        <label>Created At:</label>
        <input
          type="text"
          value={new Date(user.createdAt).toLocaleString()}
          readOnly
        />
      </Container>
    </Layout>,
  );
}
