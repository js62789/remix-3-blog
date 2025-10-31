import type { Remix } from "@remix-run/dom";

export const buttonStyles = {
  backgroundColor: "#ff8f00",
  border: "none",
  borderRadius: "4px",
  color: "white",
  cursor: "pointer",
  display: "inline-block",
  padding: "10px 20px",
  textDecoration: "none",
  "&:hover": { backgroundColor: "#e07b00" },
};

export default function Button(props: Remix.Props<"button">) {
  return (
    <button
      css={buttonStyles}
      {...props}
    />
  );
}
