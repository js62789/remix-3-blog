import { routes } from "../../routes.ts";
import Container from "./Container.tsx";
import Form from "./Form.tsx";
import { Layout } from "./Layout.tsx";

export default function LoginPage({ error }: { error?: string }) {
  return (
    <Layout>
      <Container>
        <Form method="post" action={routes.auth.login.action.href()}>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <input name="email" type="email" placeholder="Email" />
          <input name="password" type="password" placeholder="Password" />
          <button type="submit">Login</button>
        </Form>
        <p>
          Not a member? <a href={routes.auth.register.index.href()}>Register</a>
        </p>
      </Container>
    </Layout>
  );
}
