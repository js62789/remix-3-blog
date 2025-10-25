import { RouteHandlers } from "@remix-run/fetch-router";
import { routes } from "../../../routes.ts";
import { render } from "../../utils/render.ts";
import adminPostsHandlers from "./posts.tsx";
import AdminLayout from "../../components/AdminLayout.tsx";
import { getSession } from "../../middleware/session.ts";

export default {
  use: [],
  handlers: {
    index() {
      const session = getSession();

      return render(
        <AdminLayout>
          <h1>Admin Home</h1>
          <table>
            <thead>
              <tr>
                <th>Session</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{JSON.stringify(session)}</td>
              </tr>
            </tbody>
          </table>
        </AdminLayout>,
      );
    },
    posts: adminPostsHandlers,
  },
} satisfies RouteHandlers<typeof routes.admin>;
