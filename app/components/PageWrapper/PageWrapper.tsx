import { motion } from "framer-motion";
import type { HTMLProps } from "react";
import React from "react";
import { CONTENT_BACKGROUND_COLOR_CLASSNAMES } from "~/shared";

export function PageWrapper(
  props: React.PropsWithChildren & HTMLProps<HTMLDivElement>
) {
  return (
    <motion.div
      id="page-wrapper-singleton"
      className={
        CONTENT_BACKGROUND_COLOR_CLASSNAMES +
        (props.className
          ? " " + props.className
          : "m-auto min-h-full w-full max-w-screen-xl rounded-lg p-5 transition-colors duration-300")
      }
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {props.children}
    </motion.div>
  );
}
