import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  COLOR_SCHEME_COOKIE_NAME,
  isColorScheme,
} from "~/features/color-scheme";
import { getColorSchemeSession } from "~/features/color-scheme/color-scheme-utils.server";

// remix action to set theme cookie
export const action: ActionFunction = async ({ request }) => {
  const colorSchemeSession = await getColorSchemeSession(request);
  const requestText = await request.text();
  const form = new URLSearchParams(requestText);
  const colorScheme = form.get(COLOR_SCHEME_COOKIE_NAME);

  if (!isColorScheme(colorScheme)) {
    return json({
      success: false,
      message: `Color-scheme value of ${colorScheme} is not a valid theme`,
    });
  }

  colorSchemeSession.setColorScheme(colorScheme);
  return json(
    { success: true },
    { headers: { "Set-Cookie": await colorSchemeSession.commit() } }
  );
};
