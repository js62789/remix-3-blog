import process from 'node:process';
import type { Remix } from '@remix-run/dom'
import { renderToStream } from '@remix-run/dom/server';
import { createRouter, html, route } from '@remix-run/fetch-router';

function render(element: Remix.RemixElement, init?: ResponseInit) {
  return html(renderToStream(element), init)
}

const routes = route({
  home: '/',
});

const handlers = {
  home: () => {
    return render(
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Deno Remix 3</title>
        </head>
        <body>
          <h1>Hello, Deno Remix 3!</h1>
        </body>
      </html>
    );
  }
};

const router = createRouter();

router.map(routes.home, handlers.home);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3003;

Deno.serve({ port }, async (request) => {
  try {
    return await router.fetch(request);
  } catch (error) {
    console.error(error);
    return new Response('Internal Server Error', { status: 500 });
  }
});
