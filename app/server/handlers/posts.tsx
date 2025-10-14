import { RouteHandlers } from "@remix-run/fetch-router";
import { routes } from "../../routes.ts";
import { render } from "../utils/render.ts";
import { Layout } from "../components/Layout.tsx";
import { getPostBySlug, getPublishedPosts } from "../models/posts.ts";
import Header from "../components/Header.tsx";
import Card from "../components/Card.tsx";
import Container from "../components/Container.tsx";

export default {
  use: [],
  async index() {
    const posts = await getPublishedPosts();

    return render(
      <Layout>
        <Header />
        <Container>
          <h1>Blog Posts</h1>
          {posts.map((post) => (
            <Card key={post.id}>
              <a href={routes.posts.show.href({ slug: post.slug })}>
                {post.title}
              </a>
              <address>by {post.author}</address>
              <time dateTime={post.createdAt?.toISOString()}>
                {post.createdAt?.toLocaleDateString(undefined, {
                  dateStyle: "long",
                })}
              </time>
              <p>{post.excerpt}</p>
            </Card>
          ))}
        </Container>
      </Layout>,
    );
  },
  async show({ params }) {
    const { slug } = params;
    const post = await getPostBySlug(slug);

    if (!post) {
      return new Response("Not found", { status: 404 });
    }

    return render(
      <Layout>
        <Header />
        <script type="application/ld+json" id="BlogPosting">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "url": `http://localhost:3003/posts/${post.slug}`,
            "image": [
              "https://example.com/image/1x1/image.jpg",
              "https://example.com/image/4x3/image.jpg",
              "https://example.com/image/16x9/image.jpg",
            ],
            "datePublished": "2023-03-20T12:42:21.345Z",
            "dateModified": "2023-03-21T12:12:44.220Z",
            "author": {
              "@type": "Person",
              "name": "The Author",
              "url": "https://example.com/the-author",
              "sameAS": [
                "https://twitter.com/the-author",
                "https://www.linkedin.com/in/the-author/",
              ],
            },
            "publisher": {
              "@type": "Organization",
              "name": "Company Name",
              "url": "https://example.com",
              "sameAs": [
                "https://www.linkedin.com/company/company-name/",
              ],
              "logo": "https://example.com/logo.svg",
            },
          })}
        </script>
        <Container>
          <main>
            <article>
              <h1>{post.title}</h1>
              <time dateTime={post.createdAt?.toISOString()}>
                {post.createdAt?.toLocaleDateString(undefined, {
                  dateStyle: "long",
                })}
              </time>
              <address>
                Written by {post.author}
              </address>
              <br />
              {post.content}
            </article>
          </main>
        </Container>
      </Layout>,
    );
  },
} satisfies RouteHandlers<typeof routes.posts>;
