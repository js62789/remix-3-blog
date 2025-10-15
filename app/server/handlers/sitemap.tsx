import { routes } from "../../routes.ts";
import { getPublishedPosts } from "../models/posts.ts";

// https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#text
export default async function SiteMap({ request }: { request: Request }) {
  const host = new URL(request.url).origin;
  const posts = await getPublishedPosts();

  const urls = [
    routes.home.href(),
    routes.posts.index.href(),
    ...posts.map((post) => routes.posts.show.href({ slug: post.slug })),
  ];

  return new Response(urls.map((url) => `${host}${url}`).join("\n"), {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
