import { Remix } from "@remix-run/dom";
import { routes } from "../../routes.ts";
import NavLink from "./NavLink.tsx";
import { getSession } from "../middleware/session.ts";

export const headerStyles = {
  backgroundColor: "#262626ff",
  color: "white",
  display: "flex",
  height: "60px",
  justifyContent: "space-between",
};

const navStyles = {
  display: "inline-flex",
  "& > a": {
    display: "flex",
    alignItems: "center",
    paddingLeft: "30px",
    paddingRight: "30px",
    textDecoration: "none",
  },
  "& > a:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
};

function Nav({ children }: Remix.Props<"nav">) {
  return <nav css={navStyles}>{children}</nav>;
}

export default function Header() {
  const user = getSession()?.data?.user;
  const isAdmin = user?.role === "admin";

  return (
    <header
      css={headerStyles}
    >
      <Nav>
        <NavLink href={routes.home.href()}>Home</NavLink>
        <NavLink href={routes.posts.index.href()}>Blog</NavLink>
      </Nav>
      <Nav>
        {user
          ? (
            <>
              {isAdmin && (
                <NavLink href={routes.admin.index.href()}>Admin</NavLink>
              )}
              <NavLink href={routes.account.href()}>Profile</NavLink>
              <NavLink href={routes.auth.logout.index.href()}>Logout</NavLink>
            </>
          )
          : <NavLink href={routes.auth.login.index.href()}>Login</NavLink>}
      </Nav>
    </header>
  );
}
