import { Middleware } from "@remix-run/fetch-router";
import { render } from "../utils/render.ts";
import { Layout } from "../components/Layout.tsx";
import Container from "../components/Container.tsx";

export const captureError: Middleware = async (_context, next) => {
  const response = await next();
  const errorMessage = !response.ok && !response.redirected &&
    await response.text();

  if (errorMessage) {
    return render(
      <Layout>
        <Container>
          <h1>{response.status}</h1>
          <p>
            {errorMessage || "An unexpected error occurred."}
          </p>
        </Container>
      </Layout>,
      { status: response.status },
    );
  }
};
