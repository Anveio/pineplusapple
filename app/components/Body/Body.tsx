import React from "react";
import type { ColorScheme } from "~/features/color-scheme/color-scheme-constants";
import { useColorSchemeClientServerSync } from "~/features/color-scheme/color-scheme-store";

interface Props extends React.PropsWithChildren {
  initialColorScheme: ColorScheme;
}

export function Body(props: Props) {
  const { initialColorScheme } = props;

  useColorSchemeClientServerSync(initialColorScheme);

  return (
    <body className={initialColorScheme + " min-h-screen"}>
      <div
        id="themed-background-singleton"
        className={
          "h-full min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 text-black transition-colors duration-300 dark:bg-zinc-900 dark:text-white"
        }
      >
        {props.children}
      </div>
    </body>
  );
}
