import { Link } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";

import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();
  return (
    <AnimatePresence exitBeforeEnter>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -10, opacity: 0 }}
        transition={{ duration: 0.2 }}
        layout
        layoutId="top-level-navigation-main-content-change"
      >
        <h2 className="text-center text-4xl">Home</h2>
        {user ? (
          <Link
            to="/notes"
            className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50 sm:px-8"
          >
            View Notes for {user.email}
          </Link>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}
