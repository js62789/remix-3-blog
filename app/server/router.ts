import { createRouter } from "@remix-run/fetch-router";
import { logger } from "@remix-run/fetch-router/logger-middleware";
import { routes } from "../routes.ts";
import * as publicHandlers from "./handlers/public.ts";
import sitemapHandlers from "./handlers/sitemap.tsx";
import homeHandlers from "./handlers/home.tsx";
import postsHandlers from "./handlers/posts.tsx";
import adminHandlers from "./handlers/admin/index.tsx";
import session from "./middleware/session.ts";
import csrf from "./middleware/csrf.ts";
import { storeContext } from "./middleware/context.ts";
import authHandlers from "./handlers/auth.tsx";
import { captureError } from "./middleware/captureError.tsx";

const router = createRouter();

router.use(captureError);
router.use(logger());
router.use(storeContext);
router.use(session());
router.use(csrf());

router.map(routes.sitemap, sitemapHandlers);
router.map(routes.assets, publicHandlers.assets);
router.map(routes.home, homeHandlers);
router.map(routes.auth, authHandlers);
router.map(routes.posts, postsHandlers);
router.map(routes.admin, adminHandlers);

export default router;
