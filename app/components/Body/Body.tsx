import React from "react";
import { useColorScheme } from "~/features/color-scheme";

/**
 *
 */
export function Body(props: React.PropsWithChildren) {
  const { colorScheme } = useColorScheme();

  return (
    <body className={colorScheme}>
      <div
        id="themed-background-singleton"
        className={
          "h-full min-h-screen w-full overflow-x-hidden bg-gray-100 text-black transition-colors duration-300 dark:bg-zinc-800 dark:text-white"
        }
      >
        {props.children}
      </div>
    </body>
  );
}
