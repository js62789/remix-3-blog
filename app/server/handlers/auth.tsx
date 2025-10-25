import { redirect, RouteHandlers } from "@remix-run/fetch-router";
import { authenticate, logout } from "../utils/auth.ts";
import { routes } from "../../routes.ts";
import Container from "../components/Container.tsx";
import { Layout } from "../components/Layout.tsx";
import { render } from "../utils/render.ts";
import { updateSession } from "../middleware/session.ts";
import { createUser } from "../models/users.ts";
import Form from "../components/Form.tsx";
import LoginPage from "../components/LoginPage.tsx";

export default {
  use: [],
  handlers: {
    register: {
      index() {
        return render(
          <Layout>
            <Container>
              <Form method="post" action={routes.auth.register.action.href()}>
                <input name="email" type="email" placeholder="Email" />
                <input name="password" type="password" placeholder="Password" />
                <button type="submit">Register</button>
              </Form>
            </Container>
          </Layout>,
        );
      },
      async action({ formData }) {
        const email = formData.get("email")?.toString() || "";
        const password = formData.get("password")?.toString() || "";

        const user = await createUser(email, password);

        updateSession({ data: { user } });

        // Redirect to home page after registration
        return redirect(routes.home.href());
      },
    },
    login: {
      index() {
        return render(
          <LoginPage />,
        );
      },
      async action({ formData }) {
        const email = formData.get("email")?.toString() || "";
        const password = formData.get("password")?.toString() || "";

        try {
          await authenticate(email, password);
        } catch (error) {
          return render(
            <LoginPage
              error={error instanceof Error
                ? error.message
                : "Authentication failed"}
            />,
            { status: 401 },
          );
        }

        // Redirect to home page after login
        return redirect(routes.home.href());
      },
    },
    logout: {
      index() {
        logout();
        return redirect(routes.home.href());
      },
      action() {
        logout();
        return redirect(routes.home.href());
      },
    },
  },
} satisfies RouteHandlers<typeof routes.auth>;
