import * as React from "react";
import type { ColorScheme } from "./color-scheme-constants";
import { createStore, useStore } from "zustand";
import {
  createPersistedThemeCookie,
  getInitialUserPreferredColorScheme,
  getNextColorScheme,
} from "./color-scheme-utils";

export type ColorSchemeStore = {
  colorScheme: ColorScheme;
  updateColorScheme: (nextColorScheme: ColorScheme) => void;
};

/**
 * Uses the theme from the server if it exists, otherwise uses the user's
 * default color schema preference (if their OS is set to dark-mode). If the
 * user has no default preference, then it uses the light theme.
 *
 * In the case the server doesn't have a theme preference for this user then
 * it uses the default preference to quickly send a request to the endpoint
 * to persist the user's preference.
 */
export const colorSchemeStore = createStore<ColorSchemeStore>((set) => ({
  colorScheme: getInitialUserPreferredColorScheme(),
  updateColorScheme: (newTheme) => set({ colorScheme: newTheme }),
}));

export const useColorScheme = () => {
  return useStore(colorSchemeStore);
};

export const useColorSchemeClientServerSync = (
  initialColorSchemeFromServer: ColorScheme
) => {
  const { colorScheme } = useColorScheme();

  hydrateColorSchemeStoreWithCorrectValueOnlyOnInitialServerRender(
    initialColorSchemeFromServer
  );

  React.useEffect(() => {
    createPersistedThemeCookie(colorScheme);
    /**
     * Effect to toggle the tailwindcss color-scheme class on the document body
     */
    document.body.classList.add(colorScheme);
    document.body.classList.remove(getNextColorScheme(colorScheme));
  }, [colorScheme]);
};

const hydrateColorSchemeStoreWithCorrectValueOnlyOnInitialServerRender =
  (() => {
    let executedOnce = false;

    return (initialColorSchemeFromServer: ColorScheme) => {
      if (executedOnce) {
        return;
      }

      executedOnce = true;
      colorSchemeStore.setState((partial) => {
        if (partial.colorScheme === initialColorSchemeFromServer)
          return partial;
        return {
          colorScheme: initialColorSchemeFromServer,
        };
      });
    };
  })();
