import type { Remix } from "@remix-run/dom";

export const buttonStyles = {
  backgroundColor: "#2d6aaa",
  border: "none",
  borderRadius: "4px",
  color: "white",
  cursor: "pointer",
  display: "inline-block",
  padding: "10px 20px",
  textDecoration: "none",
  "&:hover": { backgroundColor: "#0056b3" },
};

export default function Button(props: Remix.Props<"button">) {
  return (
    <button
      css={buttonStyles}
      {...props}
    />
  );
}
