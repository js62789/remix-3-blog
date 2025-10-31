import type { Remix } from "@remix-run/dom";

export const buttonStyles = {
  backgroundColor: "#006147",
  border: "none",
  borderRadius: "4px",
  color: "#FFF",
  cursor: "pointer",
  display: "inline-block",
  padding: "10px 20px",
  textDecoration: "none",
  "&:hover": { backgroundColor: "#004d40" },
};

export default function Button(props: Remix.Props<"button">) {
  return (
    <button
      css={buttonStyles}
      {...props}
    />
  );
}
