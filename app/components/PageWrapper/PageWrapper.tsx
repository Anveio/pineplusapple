import React from "react";

export function PageWrapper(props: React.PropsWithChildren) {
  return (
    <div
      id="page-wrapper-singleton"
      className="m-auto min-h-full w-full max-w-screen-xl rounded-lg bg-white p-5 transition-colors duration-300 dark:bg-zinc-800"
    >
      {props.children}
    </div>
  );
}
