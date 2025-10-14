import { Remix } from "@remix-run/dom";
import AdminNav from "./AdminNav.tsx";
import { headerStyles } from "./Header.tsx";
import { Layout } from "./Layout.tsx";
import Header from "./Header.tsx";

export default function AdminLayout(
  { children }: Remix.Props<"div">,
) {
  return (
    <Layout>
      <Header />
      <div
        css={{
          display: "flex",
          height: `calc(100vh - ${headerStyles.height})`,
        }}
      >
        <div css={{ backgroundColor: "#f0f0f0", width: "250px" }}>
          <AdminNav />
        </div>
        <div css={{ flexGrow: 1, padding: "20px" }}>
          {children}
        </div>
      </div>
    </Layout>
  );
}
