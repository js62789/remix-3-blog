import { resources, route } from "@remix-run/fetch-router";

export const routes = route({
  assets: "/assets/*path",
  home: "/",
  sitemap: "/sitemap.txt",
  posts: resources("posts", {
    only: ["index", "show"],
    param: "slug",
  }),
  admin: route("/admin", {
    index: "/",
    posts: resources("posts", {
      only: ["index", "edit", "new", "create", "update", "destroy"],
      param: "slug",
    }),
  }),
});
