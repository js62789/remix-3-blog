import { Remix } from "@remix-run/dom";
import { getCsrfToken } from "../middleware/csrf.ts";

export default function Form({ children, ...rest }: Remix.Props<"form">) {
  const csrfToken = getCsrfToken();

  return (
    <form {...rest}>
      <input type="hidden" name="_csrf" value={csrfToken} />
      {children}
    </form>
  );
}
