import { createCookieSessionStorage } from "@remix-run/node";
import { SESSION_SECRET } from "~/server/environment";
import type { ColorScheme } from "./color-scheme-constants";
import { COLOR_SCHEME_COOKIE_NAME } from "./color-scheme-constants";
import { isColorScheme } from "./color-scheme-utils";

const colorSchemeStorage = createCookieSessionStorage({
  cookie: {
    name: COLOR_SCHEME_COOKIE_NAME,
    secure: true,
    secrets: [SESSION_SECRET],
    sameSite: "lax",
    path: "/",
    httpOnly: true,
  },
});

export const getColorSchemeSession = async (request: Request) => {
  const session = await colorSchemeStorage.getSession(
    request.headers.get("Cookie")
  );
  return {
    getColorScheme: () => {
      const themeValue = session.get(COLOR_SCHEME_COOKIE_NAME);

      console.log("Getting theme value", themeValue);

      return isColorScheme(themeValue) ? themeValue : null;
    },
    setColorScheme: (theme: ColorScheme) =>
      session.set(COLOR_SCHEME_COOKIE_NAME, theme),
    commit: () => colorSchemeStorage.commitSession(session),
  };
};
