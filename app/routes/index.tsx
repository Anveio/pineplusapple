import { Link } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import { ColorSchemeButton } from "~/features/color-scheme";
import { DEFAULT_MAIN_CLASSES } from "~/shared";

import { useOptionalUser } from "~/utils";

export default function Index() {
  const user = useOptionalUser();
  return (
    <main className={DEFAULT_MAIN_CLASSES}>
      <AnimatePresence exitBeforeEnter>
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex w-screen items-center justify-center bg-slate-50 text-black dark:bg-zinc-900 dark:text-white">
            <div
              className={`flex w-full max-w-screen-sm items-center justify-between py-4`}
            >
              <h1 className="flex items-center text-left text-2xl">🌲+🍎</h1>
              <div className="flex justify-end">
                <div className="grid h-full grid-cols-2 gap-5 sm:space-y-0">
                  <Link
                    to="/join"
                    className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50 sm:px-8"
                  >
                    Sign up
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center justify-center rounded-md bg-blue-500 px-4 py-3 font-medium text-white hover:bg-blue-600"
                  >
                    Log In
                  </Link>
                </div>
                <div className="ml-3 flex items-center">
                  <ColorSchemeButton />
                </div>
              </div>
            </div>
          </div>
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
    </main>
  );
}
