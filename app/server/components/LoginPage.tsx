import { routes } from "../../routes.ts";
import Button from "./Button.tsx";
import Container from "./Container.tsx";
import Form from "./Form.tsx";
import { Layout } from "./Layout.tsx";

export default function LoginPage({ error }: { error?: string }) {
  return (
    <Layout>
      <Container>
        <h1>Login</h1>
        <p>
          Not a member? <a href={routes.auth.register.index.href()}>Register</a>
        </p>
        <Form method="post" action={routes.auth.login.action.href()}>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <input name="email" type="email" placeholder="Email" />
          <input name="password" type="password" placeholder="Password" />
          <Button type="submit">Login</Button>
        </Form>
      </Container>
    </Layout>
  );
}
