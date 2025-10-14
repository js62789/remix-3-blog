import type { Remix } from "@remix-run/dom";

export default function Container(props: Remix.Props<"div">) {
  return (
    <div
      css={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}
      {...props}
    />
  );
}
