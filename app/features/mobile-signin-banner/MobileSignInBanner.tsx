import { Link, useLocation } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { getTopLevelRoute, TopLevelRoute, useOptionalUser } from "~/shared";

export const MobileSignInBanner: React.FC = () => {
  const user = useOptionalUser();

  const location = useLocation();
  const topLevelRoute = getTopLevelRoute(location);

  const isLoggedIn = !!user;
  const isAlreadyLoggingIn =
    topLevelRoute === TopLevelRoute.Join ||
    topLevelRoute === TopLevelRoute.Login;

  return (
    <AnimatePresence>
      {isLoggedIn || isAlreadyLoggingIn ? null : (
        <motion.div
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid w-full max-w-screen-sm sm:hidden">
            <div className="rounded-lg bg-white p-5 shadow-lg dark:bg-zinc-900">
              <div className="flex flex-col items-center">
                <div className="mt-4 text-center">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Sign in to your account
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-300">
                      To browse our collection, please sign in.
                      <span className="block">
                        (It's quick and we'll never send you spam, we promise)
                      </span>
                      <Link
                        to="/login"
                        className="font-medium text-blue-600 hover:text-blue-500 dark:hover:text-blue-400"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
