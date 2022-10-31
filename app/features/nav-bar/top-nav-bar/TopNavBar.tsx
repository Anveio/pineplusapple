import { Link, useLocation } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { ColorSchemeButton } from "~/features/color-scheme";
import { getTopLevelRoute, MOBILE_TOP_LEVEL_TABS } from "../utils";

const TopNavBar: React.FC = () => {
  const location = useLocation();

  const currentTopLevelRoute = getTopLevelRoute(location);

  return (
    <nav>
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex hidden w-screen items-center justify-center bg-slate-50 text-black dark:bg-zinc-900 dark:text-white sm:block">
          <div
            className={`flex w-full max-w-screen-xl items-center justify-between p-4`}
          >
            <Link
              to={"/"}
              className="flex select-none items-center text-left text-2xl"
            >
              🌲+🍎
            </Link>
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
      </motion.div>
    </nav>
  );
};

const SELECTED_TAB_ANIMATION_CONFIG: React.ComponentProps<
  typeof motion.div
>["transition"] = {
  type: "tween",
  duration: 0.3,
  ease: "easeOut",
};

export { TopNavBar };
