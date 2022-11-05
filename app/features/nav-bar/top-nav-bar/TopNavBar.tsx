import { Form, Link, useLocation } from "@remix-run/react";
import { motion } from "framer-motion";
import * as React from "react";
import { AppLogo } from "~/components/AppLogo";
import { SearchBar } from "~/features/nav-bar/top-nav-bar/search-bar";
import { SettingsMenu } from "~/features/nav-bar/top-nav-bar/settings-menu";
import {
  BACKGROUND_COLOR_CLASSNAMES,
  PRIMARY_BUTTON_TEXT_CLASSNAMES,
  useOptionalUser,
} from "~/shared";
import { ICON_SIZE } from "../constants";

const TopNavBar: React.FC = () => {
  const location = useLocation();

  return (
    <>
      <nav className={BACKGROUND_COLOR_CLASSNAMES}>
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="m-auto block max-w-screen-xl">
            <div
              className={`grid grid-cols-[max-content,_1fr] justify-between gap-12 py-4`}
            >
              <Link
                to={"/"}
                className={`flex select-none items-center text-left text-top-navbar`}
              >
                <AppLogo size={ICON_SIZE} />
              </Link>
              <div className="grid grid-cols-[1fr_minmax(max-content,2.5rem)] content-center gap-2">
                <SearchBar />
                <SettingsMenu />
              </div>
            </div>
          </div>
        </motion.div>
      </nav>
    </>
  );
};

const AuthSection = () => {
  const user = useOptionalUser();

  if (user) {
    return (
      <Form action="/logout" method="post">
        <button
          type="submit"
          className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
        >
          Logout
        </button>
      </Form>
    );
  }

  return (
    <div className="grid h-full grid-cols-2 gap-5 sm:space-y-0">
      <Link
        to="/join"
        className="flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50 sm:px-8"
      >
        Sign up
      </Link>
      <Link
        to="/login"
        className={
          "flex items-center justify-center rounded-md bg-blue-500 px-4 py-3 hover:bg-blue-600" +
          PRIMARY_BUTTON_TEXT_CLASSNAMES
        }
      >
        Log In
      </Link>
    </div>
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
