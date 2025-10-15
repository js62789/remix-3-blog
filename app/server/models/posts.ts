import { LocalFileStorage } from "@remix-run/file-storage/local";

export const statusTypes = ["draft", "published"] as const;

interface Post {
  id: string;
  author: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: typeof statusTypes[number];
  createdAt?: Date;
  updatedAt?: Date;
}

const postStorage = new LocalFileStorage("./posts");

export async function getPublishedPosts() {
  const posts = await getAllPosts();
  return posts.filter((post) => post.status === "published");
}

export async function getAllPosts() {
  const { files } = await postStorage.list();

  return Promise.all(files.map(async ({ key }) => {
    // Get the file
    const file = await postStorage.get(key);
    // Read the file contents as JSON
    const post = JSON.parse(await file!.text()) as Post;
    post.createdAt = new Date(post.createdAt!);
    post.updatedAt = new Date(post.updatedAt!);
    return post;
  }));
}

export async function getPostById(id: string) {
  const posts = await getAllPosts();
  return posts.find((post) => post.id === id);
}

export async function getPostBySlug(slug: string) {
  const posts = await getAllPosts();
  return posts.find((post) => post.slug === slug);
}

export async function createPost({
  title,
  content,
  excerpt,
  status = "draft",
}: Pick<Post, "title" | "content" | "excerpt" | "status">) {
  const posts = await getAllPosts();
  const newPost: Post = {
    id: (posts.length + 1).toString(),
    author: "Jeffrey Smith",
    title,
    content,
    excerpt,
    slug: title.toLowerCase().replace(/\s+/g, "-"),
    status,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Check for duplicate ID
  if (await postStorage.has(newPost.id)) {
    throw new Error("Post with this ID already exists");
  }

  // Save the new post
  postStorage.set(
    newPost.id,
    new File([JSON.stringify(newPost, null, 2)], `${newPost.id}.json`, {
      type: "application/json",
    }),
  );

  return newPost;
}

export async function updatePost({
  slug,
  title,
  content,
  excerpt,
  status = "draft",
}: Pick<Post, "slug" | "title" | "content" | "excerpt" | "status">) {
  const post = await getPostBySlug(slug);

  if (!post) {
    throw new Error("Post not found");
  }

  // Update post details
  post.title = title;
  post.content = content;
  post.excerpt = excerpt;
  post.updatedAt = new Date();
  post.slug = title.toLowerCase().replace(/\s+/g, "-");
  post.status = status;

  // Save the updated post
  postStorage.set(
    post.id,
    new File([JSON.stringify(post, null, 2)], `${post.id}.json`, {
      type: "application/json",
    }),
  );

  return getPostById(post.id);
}

export async function deletePostBySlug(slug: string) {
  const post = await getPostBySlug(slug);

  if (!post) {
    throw new Error("Post not found");
  }

  await postStorage.remove(post.id);
}
