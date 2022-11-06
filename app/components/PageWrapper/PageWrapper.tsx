import { motion } from "framer-motion";
import type { HTMLProps } from "react";
import React from "react";
import { CONTENT_BACKGROUND_COLOR_CLASSNAMES } from "~/shared";

export function PageWrapper(
  props: React.PropsWithChildren &
    HTMLProps<HTMLDivElement> & { title?: string }
) {
  return (
    <div id="page-wrapper-singleton">
      {props.title ? (
        <h2 className="m-auto mb-4 w-full max-w-screen-xl text-left text-4xl font-bold">
          {props.title}
        </h2>
      ) : null}
      <motion.div
        className={
          CONTENT_BACKGROUND_COLOR_CLASSNAMES +
          (props.className
            ? props.className
            : "m-auto  w-full max-w-screen-xl rounded-lg p-5 ")
        }
        layout
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {props.children}
      </motion.div>
    </div>
  );
}
