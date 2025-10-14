import { hydrated } from "@remix-run/dom";
import { press } from "@remix-run/events/press";
import { routes } from "../../routes.ts";

export const Button = hydrated(
  routes.assets.href({ path: "components/Button.js#Button" }),
  function DehydratedButton() {
    const doSomething = () => {
      alert("Button clicked!");
    };
    return () => (
      <button on={press(() => doSomething())} type="button">Click Me</button>
    );
  },
);
