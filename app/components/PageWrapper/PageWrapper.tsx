import { motion } from "framer-motion";
import React from "react";

export function PageWrapper(props: React.PropsWithChildren) {
  return (
    <motion.div
      id="page-wrapper-singleton"
      className="m-auto min-h-full w-full max-w-screen-xl rounded-lg bg-white p-5 transition-colors duration-300 dark:bg-zinc-800"
      animate={{ x: 0, opacity: 1 }}
      initial={{ x: 30, opacity: 0 }}
      exit={{ x: -30, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {props.children}
    </motion.div>
  );
}
