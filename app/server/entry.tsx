import process from "node:process";
import router from "./router.ts";

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3003;

Deno.serve({ hostname: "127.0.0.1", port }, async (request) => {
  try {
    return await router.fetch(request);
  } catch (error) {
    console.error(error);
    // TODO provide stack in dev mode
    return new Response("Internal Server Error", { status: 500 });
  }
});
