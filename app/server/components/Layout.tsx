import type { Remix } from "@remix-run/dom";
import { routes } from "../../routes.ts";

export function Layout({ children }: { children: Remix.RemixNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Deno Remix 3</title>
        <script
          type="module"
          async
          src={routes.assets.href({ path: "entry.js" })}
        />
        <style
          innerHTML={`
          /* CSS Reset */
          *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
          button, input, select, textarea { font: inherit; color: inherit; line-height: inherit; }
          button { background: none; border: none; cursor: pointer; }
          img { display: block; max-width: 100%; }
          a { color: inherit; }

          /* Base Styles */
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; min-height: 100vh; color: #333; }
          input, textarea { border: 1px solid #ccc; border-radius: 4px; padding: 4px; width: 100%; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #eee; }
          h1 { font-size: 2.8em; }
          h1, h2, h3, h4, h5, h6 { line-height: 2; }
          p { margin-bottom: 1em; }
          select { padding: 4px; border: 1px solid #ccc; border-radius: 4px; }
          label { display: block; margin-bottom: 0.5em; }
          `}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
