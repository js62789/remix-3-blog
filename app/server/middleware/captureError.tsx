import { Middleware } from "@remix-run/fetch-router";
import { render } from "../utils/render.ts";
import { Layout } from "../components/Layout.tsx";
import Container from "../components/Container.tsx";

/**
 * Middleware for capturing errors and rendering a user-friendly error page.
 * This middleware should be used early in the middleware chain to catch errors from subsequent middleware and handlers.
 *
 * @param _context RequestContext
 * @param next Function executing the rest of the middleware
 * @returns Response
 */
export const captureError: Middleware = async (_context, next) => {
  const response = await next();
  console.log("response format", response.headers.get("content-type"));
  const errorMessage = !response.ok && !response.redirected &&
    response.headers.get("content-type") !== "text/html; charset=UTF-8" &&
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
