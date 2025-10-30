module.exports = {
  ci: {
    collect: {
      startServerCommand: "PORT=3000 deno task start",
      url: [
        "http://localhost:3000",
        "http://localhost:3000/posts",
        "http://localhost:3000/posts/my-first-post",
        "http://localhost:3000/login",
        "http://localhost:3000/register",
      ],
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
