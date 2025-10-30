module.exports = {
  ci: {
    collect: {
      startServerCommand: "deno task start",
      url: [
        "http://localhost:3000/",
        "http://localhost/posts",
        "http://localhost/posts/my-first-post",
        "http://localhost/login",
        "http://localhost/register",
      ],
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
