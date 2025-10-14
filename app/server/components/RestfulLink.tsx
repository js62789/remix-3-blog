import type { Remix } from "@remix-run/dom";

interface RestfulLinkProps extends Remix.Props<"a"> {
  method: string;
  /**
   * The name of the hidden <input> field that contains the method override value.
   * Default is `_method`.
   */
  methodOverrideField?: string;
}

/**
 * A link that performs a RESTful action by wrapping a `<button>` in a `<form>`.
 * It should look and behave like a standard `<a>` link, but it can use HTTP methods.
 *
 * This is useful for actions like `DELETE` that are not supported by standard
 * `<a>` links.
 */
export default function RestfulLink(
  this: Remix.Handle,
  { href, method, methodOverrideField = "_method", children }: RestfulLinkProps,
) {
  method = method.toUpperCase();

  if (method === "GET") {
    return <a href={href}>{children}</a>;
  }

  return (
    <form
      action={href}
      method="POST"
      style={{ display: "inline" }}
    >
      {method !== "POST" && (
        <input type="hidden" name={methodOverrideField} value={method} />
      )}
      <button
        type="submit"
        role="link"
        style={{
          backgroundColor: "transparent",
          border: 0,
          textDecoration: "underline",
        }}
      >
        {children}
      </button>
    </form>
  );
}
