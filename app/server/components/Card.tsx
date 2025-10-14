import { Remix } from "@remix-run/dom";

export default function Card(props: Remix.Props<"div">) {
  return (
    <div
      css={{
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        backgroundColor: "#fff",
        marginBottom: "20px",
      }}
      {...props}
    />
  );
}
