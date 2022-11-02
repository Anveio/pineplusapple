import { motion } from "framer-motion";
import React from "react";
import { CONTENT_BACKGROUND_COLOR_CLASSNAMES } from "~/shared";

export function PageWrapper(props: React.PropsWithChildren) {
  return (
    <motion.div
      id="page-wrapper-singleton"
      className={
        "m-auto min-h-full w-full max-w-screen-xl rounded-lg p-5 transition-colors duration-300" +
        CONTENT_BACKGROUND_COLOR_CLASSNAMES
      }
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      layoutId="top-level-page-transition"
    >
      {props.children}
    </motion.div>
  );
}
