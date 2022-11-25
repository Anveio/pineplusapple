import {
  ColorScheme,
  COLOR_SCHEME_COOKIE_NAME,
} from "./color-scheme-constants";
import * as z from "zod";

export const getNextColorScheme = (theme: ColorScheme): ColorScheme => {
  switch (theme) {
    case ColorScheme.LIGHT:
      return ColorScheme.DARK;
    case ColorScheme.DARK:
      return ColorScheme.LIGHT;
  }
};

export const isColorScheme = (value: unknown): value is ColorScheme => {
  return !!z.nativeEnum(ColorScheme).safeParse(value);
};

/**
 * Returns the color-scheme provided by the user's OS only *after* the document
 * has loaded. This is best to use to get the initial color-scheme before
 * the user has ever set a cookie via the color-scheme switcher or by us
 * setting the cookie for them after getting their preferred OS-level color scheme.
 */
export const getInitialUserPreferredColorScheme = (): ColorScheme => {
  if (
    globalThis.matchMedia &&
    globalThis.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return ColorScheme.DARK;
  } else {
    return ColorScheme.LIGHT;
  }
};

export const requestPersistedThemeCookie = (colorScheme: ColorScheme) => {
  const body = new URLSearchParams();

  body.append(COLOR_SCHEME_COOKIE_NAME, colorScheme);

  return fetch("/api/v1/set-color-scheme", {
    body,
    method: "POST",
  });
};
