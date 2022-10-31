import React from "react";

export function PageWrapper(props: React.PropsWithChildren) {
  return (
    <div className="relative mt-3 flex min-h-screen w-full items-stretch justify-center">
      <div className="min-h-full w-full max-w-screen-xl bg-gray-100 transition-colors duration-300 dark:bg-zinc-800">
        {props.children}
      </div>
    </div>
  );
}
