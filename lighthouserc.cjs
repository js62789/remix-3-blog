module.exports = {
  ci: {
    collect: {
      startServerCommand: "deno task start",
      url: [
        "http://localhost:3003",
        "http://localhost:3003/posts",
        "http://localhost:3003/posts/my-first-post",
        "http://localhost:3003/login",
        "http://localhost:3003/register",
      ],
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
