import { formAction, resources, route } from "@remix-run/fetch-router";

export const routes = route({
  assets: "/assets/*path",
  favicons: "/favicons/*path",
  home: "/",
  auth: {
    register: formAction("/register"),
    login: formAction("/login"),
    logout: formAction("/logout"),
  },
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
