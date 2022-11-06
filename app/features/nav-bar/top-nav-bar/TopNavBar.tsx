import { Form, Link, useLocation } from "@remix-run/react";
import { motion } from "framer-motion";
import * as React from "react";
import { AppLogo } from "~/components/AppLogo";
import { ModalLayer } from "~/features/modal-layer/ModalLayer";
import { SearchBar } from "~/features/nav-bar/top-nav-bar/search-bar";
import { SettingsMenu } from "~/features/nav-bar/top-nav-bar/settings-menu";
import {
  BACKGROUND_COLOR_CLASSNAMES,
  getTopLevelRoute,
  PRIMARY_BUTTON_CLASSNAMES,
  TopLevelRoute,
  useOptionalUser,
} from "~/shared";
import { ICON_SIZE } from "../constants";

const TopNavBar: React.FC = () => {
  const location = useLocation();
  const maybeUser = useOptionalUser();

  return (
    <>
      <nav className={BACKGROUND_COLOR_CLASSNAMES + " relative "}>
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className=" m-auto block max-w-screen-xl">
            <div
              className={`grid grid-cols-[max-content,_1fr] justify-between gap-12 py-4`}
            >
              <div className="grid grid-cols-2">
                <Link
                  to={"/"}
                  className={`flex select-none items-center rounded-lg text-left text-top-navbar hover:bg-terracotta-blond focus:bg-terracotta-blond dark:hover:bg-terracotta-konbu dark:focus:bg-terracotta-konbu`}
                >
                  <AppLogo size={ICON_SIZE} />
                </Link>
              </div>

              {maybeUser ? (
                <div className="grid grid-cols-[1fr_minmax(max-content,2.5rem)] content-center gap-2">
                  <SearchBar />
                  <SettingsMenu />
                </div>
              ) : (
                <div className="align-center flex justify-end gap-2">
                  <AuthSection />
                  <SettingsMenu />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </nav>
    </>
  );
};

const AuthSection = () => {
  const location = useLocation();

  if (location.pathname === "/" + TopLevelRoute.Login) {
    return null;
  }

  if (location.pathname === "/" + TopLevelRoute.Join) {
    return null;
  }

  return (
    <div className="grid-cols grid place-items-center gap-3">
      <Link to="/login" className={"" + PRIMARY_BUTTON_CLASSNAMES}>
        Log In
      </Link>
    </div>
  );
};

export { TopNavBar };
