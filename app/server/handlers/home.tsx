import { Layout } from "../components/Layout.tsx";
import Header from "../components/Header.tsx";
import { render } from "../utils/render.ts";
import { routes } from "../../routes.ts";
import Container from "../components/Container.tsx";
import Card from "../components/Card.tsx";
import { getPublishedPosts } from "../models/posts.ts";
import { buttonStyles } from "../components/Button.tsx";

const heroStyles = {
  backgroundColor: "#9bc4dcff",
  lineHeight: 2,
  padding: "60px",
  textAlign: "center",
};

export default async function Home() {
  const posts = await getPublishedPosts();

  return render(
    <Layout>
      <Header />
      <div css={heroStyles}>
        <Container>
          <h1>An Engineer's Blog</h1>
          <p>Come along as we expore the world of JavaScript.</p>
          <a css={buttonStyles} href={routes.posts.index.href()}>
            Read the Blog
          </a>
        </Container>
      </div>
      <Container style={{ display: "flex", gap: "20px" }}>
        {posts.slice(0, 3).map((post) => (
          <Card key={post.id} style={{ flex: 1 }}>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
            <a href={routes.posts.show.href({ slug: post.slug })}>Read More</a>
          </Card>
        ))}
      </Container>
    </Layout>,
  );
}
