import { routes } from "../../routes.ts";
import NavLink from "./NavLink.tsx";

const navStyles = {
  display: "flex",
  flexDirection: "column",
  "& > a": {
    display: "flex",
    alignItems: "center",
    padding: "20px 30px",
  },
  "& > a:hover": { backgroundColor: "rgba(0, 0, 0, 0.1)" },
};

export default function AdminNav() {
  return (
    <nav css={navStyles}>
      <NavLink href={routes.admin.index.href()}>Admin - Home</NavLink>
      <NavLink href={routes.admin.posts.index.href()}>Admin - Posts</NavLink>
    </nav>
  );
}
