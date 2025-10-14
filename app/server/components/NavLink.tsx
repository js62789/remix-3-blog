import type { Remix } from "@remix-run/dom";

export default function NavLink(
  props: Remix.Props<"a">,
) {
  return (
    <a
      css={{
        display: "inline-block",
      }}
      {...props}
    />
  );
}
