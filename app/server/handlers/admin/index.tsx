import { RouteHandlers } from "@remix-run/fetch-router";
import { routes } from "../../../routes.ts";
import { render } from "../../utils/render.ts";
import adminPostsHandlers from "./posts.tsx";
import AdminLayout from "../../components/AdminLayout.tsx";

export default {
  use: [],
  handlers: {
    index() {
      return render(
        <AdminLayout>
          <h1>Admin Home</h1>
        </AdminLayout>,
      );
    },
    posts: adminPostsHandlers,
  },
} satisfies RouteHandlers<typeof routes.admin>;
