import { redirect, RouteHandlers } from "@remix-run/fetch-router";
import { routes } from "../../../routes.ts";
import { render } from "../../utils/render.ts";
import {
  createPost,
  deletePostBySlug,
  getAllPosts,
  getPostBySlug,
  statusTypes,
  updatePost,
} from "../../models/posts.ts";
import AdminLayout from "../../components/AdminLayout.tsx";
import Button, { buttonStyles } from "../../components/Button.tsx";
import RestfulForm from "../../components/RestfulForm.tsx";
import RestfulLink from "../../components/RestfulLink.tsx";

export default {
  use: [],
  handlers: {
    async index() {
      const posts = await getAllPosts();

      return render(
        <AdminLayout>
          <h1>Admin Blog Posts</h1>
          <div style={{ marginBottom: "10px" }}>
            <a css={buttonStyles} href={routes.admin.posts.new.href()}>
              Create New Post
            </a>
          </div>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <a href={routes.admin.posts.edit.href({ slug: post.slug })}>
                      {post.title}
                    </a>
                  </td>
                  <td>{post.status}</td>
                  <td>
                    <a
                      css={{ display: "inline-block", marginRight: "10px" }}
                      href={routes.admin.posts.edit.href({ slug: post.slug })}
                    >
                      Edit
                    </a>
                    <RestfulLink
                      method="DELETE"
                      href={routes.admin.posts.destroy.href({
                        slug: post.slug,
                      })}
                    >
                      Delete
                    </RestfulLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminLayout>,
      );
    },
    async edit({ params }) {
      const { slug } = params!;
      const post = await getPostBySlug(slug);

      if (!post) {
        return new Response("Not found", { status: 404 });
      }

      return render(
        <AdminLayout>
          <h1>Update Post</h1>
          <RestfulForm
            method="PUT"
            action={routes.admin.posts.update.href({ slug: post.slug })}
          >
            <div>
              <label>
                Title: <input type="text" name="title" value={post.title} />
              </label>
            </div>
            <div>
              <label>
                Excerpt:{" "}
                <textarea name="excerpt" rows={3}>{post.excerpt}</textarea>
              </label>
            </div>
            <div>
              <label>
                Content:{" "}
                <textarea name="content" rows={10}>{post.content}</textarea>
              </label>
            </div>
            <div>
              <label>
                Status:
                <select name="status">
                  {statusTypes.map((status) => (
                    <option
                      key={status}
                      selected={post.status === status}
                      value={status}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <Button type="submit">Update Post</Button>
          </RestfulForm>
        </AdminLayout>,
      );
    },
    new() {
      return render(
        <AdminLayout>
          <h1>Create New Post</h1>
          <form method="post" action={routes.admin.posts.create.href()}>
            <div>
              <label>
                Title: <input type="text" name="title" />
              </label>
            </div>
            <div>
              <label>
                Content: <textarea name="content" />
              </label>
            </div>
            <Button type="submit">Create Post</Button>
          </form>
        </AdminLayout>,
      );
    },
    create({ formData }) {
      const title = formData.get("title") as string;
      const content = formData.get("content") as string;
      const excerpt = formData.get("excerpt") as string;
      const status = formData.get("status") as typeof statusTypes[number];

      createPost({ title, content, excerpt, status });

      return redirect(routes.admin.posts.index.href());
    },
    update({ params, formData }) {
      const { slug } = params;
      const title = formData.get("title") as string;
      const content = formData.get("content") as string;
      const status = formData.get("status") as typeof statusTypes[number];
      const excerpt = formData.get("excerpt") as string;

      updatePost({ slug, title, content, status, excerpt });

      return redirect(routes.admin.posts.index.href());
    },
    destroy({ params }) {
      const { slug } = params!;
      deletePostBySlug(slug);
      return redirect(routes.admin.posts.index.href());
    },
  },
} satisfies RouteHandlers<typeof routes.admin.posts>;
