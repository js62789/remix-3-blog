import { InferRouteHandler } from "@remix-run/fetch-router";
import { openFile } from "@remix-run/lazy-file/fs";
import path from "node:path";
import { routes } from "../../routes.ts";

const publicDir = path.join(import.meta.dirname!, "../../..", "public");
const publicAssetsDir = path.join(publicDir, "assets");
const publicFaviconsDir = path.join(publicDir, "favicons");

function isNoEntityError(
  error: unknown,
): error is NodeJS.ErrnoException & { code: "ENOENT" } {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

function serveFile(filename: string): Response {
  try {
    const file = openFile(filename);

    return new Response(file, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
        "Content-Type": file.type,
      },
    });
  } catch (error) {
    if (isNoEntityError(error)) {
      return new Response("Not found", { status: 404 });
    }

    throw error;
  }
}

export const assets: InferRouteHandler<typeof routes.assets> = ({ params }) => {
  return serveFile(path.join(publicAssetsDir, params.path));
};

export const favicons: InferRouteHandler<typeof routes.favicons> = (
  { params },
) => {
  return serveFile(path.join(publicFaviconsDir, params.path));
};
