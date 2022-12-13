import { Link, useLocation } from "@remix-run/react";
import * as React from "react";
import { AppLogo } from "~/components/AppLogo";
import { useActiveModal } from "~/features/modal-layer";
import { SearchBar } from "~/features/nav-bar/top-nav-bar/search-bar";
import { SettingsMenu } from "~/features/nav-bar/top-nav-bar/settings-menu";
import {
  BACKGROUND_COLOR_CLASSNAMES,
  PRIMARY_BUTTON_CLASSNAMES,
  TopLevelRoute,
  useOptionalUser,
} from "~/shared";
import { ICON_SIZE } from "../constants";

const TopNavBar: React.FC = () => {
  const maybeUser = useOptionalUser();
  const { setActiveModal } = useActiveModal();

  return (
    <div
      className="relative"
      onClick={() => {
        console.log("SETTING ACTIVE MODAL NULL)");
        setActiveModal(null);
      }}
    >
      <nav className={BACKGROUND_COLOR_CLASSNAMES + " relative "}>
        <div>
          <div className=" m-auto block max-w-screen-xl">
            <div
              className={`grid grid-cols-[max-content,_1fr] justify-between gap-12 py-4`}
            >
              <Link
                to={"/"}
                className={`flex select-none items-center rounded-lg text-left text-top-navbar hover:bg-terracotta-blond focus:bg-terracotta-blond`}
              >
                <AppLogo size={ICON_SIZE} />
              </Link>

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
        </div>
      </nav>
    </div>
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
      <Link to="/login" className={PRIMARY_BUTTON_CLASSNAMES}>
        Log In
      </Link>
    </div>
  );
};

export { TopNavBar };
