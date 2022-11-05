import { Link, useLocation } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { BACKGROUND_COLOR_CLASSNAMES } from "~/shared";
import { getTopLevelRoute, TopLevelRoute } from "~/shared/utils";
import { BOTTOM_NAVBAR_FONT_SIZE } from "../constants";

const MobileNavbar: React.FC = () => {
  const location = useLocation();

  const currentTopLevelRoute = getTopLevelRoute(location);
  // The top level route can be a lot of things. If it's not one of the tabs, assume it's the home tab.
  const coercedToplevelRoute = SET_OF_TOP_LEVEL_ROUTES.has(currentTopLevelRoute)
    ? currentTopLevelRoute
    : TopLevelRoute.Home;

  return (
    <nav className={`sm:hidden ${BACKGROUND_COLOR_CLASSNAMES}`}>
      <div className="opacity-0.25 bg-slate-35 grid w-screen place-items-center">
        <ul
          className={`grid w-full max-w-min grid-cols-mobile-nav rounded-full bg-slate-200 p-4 text-black dark:bg-zinc-200`}
        >
          {TOP_LEVEL_MOBILE_TABS.map((item) => {
            const isActiveTab = item.key === coercedToplevelRoute;

            return (
              <Link
                aria-label={item.label}
                key={item.key}
                tabIndex={0}
                className={`relative flex select-none justify-center p-4 transition-all duration-300  hover:grayscale-0 ${
                  isActiveTab ? "grayscale-0" : "grayscale"
                }`}
                to={item.href}
              >
                <div className={`z-30 flex items-center `}>
                  <span>{item.icon}</span>
                </div>
                {isActiveTab ? (
                  <>
                    <div className="absolute -bottom-px z-20 flex w-full justify-center">
                      <motion.div
                        className="h-1 w-1/2 rounded-full bg-emerald-500"
                        transition={SELECTED_TAB_ANIMATION_CONFIG}
                        layout
                        layoutId="nav-underline"
                      />
                    </div>
                    <motion.div
                      className="absolute top-0 h-full w-full rounded-full bg-zinc-300 dark:bg-white "
                      layout
                      layoutId="nav-bubble"
                      transition={SELECTED_TAB_ANIMATION_CONFIG}
                    />
                  </>
                ) : null}
              </Link>
            );
          })}
        </ul>
      </div>
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

const HomeIcon = (
  <svg
    width={BOTTOM_NAVBAR_FONT_SIZE}
    height={BOTTOM_NAVBAR_FONT_SIZE}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    color="#000000"
  >
    <path
      d="M3 9.5L12 4l9 5.5M19 13v6.4a.6.6 0 01-.6.6H5.6a.6.6 0 01-.6-.6V13"
      stroke="#000000"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
  </svg>
);

const BagIcon = (
  <svg
    width={BOTTOM_NAVBAR_FONT_SIZE}
    height={BOTTOM_NAVBAR_FONT_SIZE}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    color="#000000"
  >
    <path
      d="M4.508 20h14.984a.6.6 0 00.592-.501l1.8-10.8A.6.6 0 0021.292 8H2.708a.6.6 0 00-.592.699l1.8 10.8a.6.6 0 00.592.501z"
      stroke="#000000"
      strokeWidth="1.5"
    ></path>
    <path
      d="M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2"
      stroke="#000000"
      strokeWidth="1.5"
    ></path>
  </svg>
);

const ShopIcon = (
  <svg
    width={BOTTOM_NAVBAR_FONT_SIZE}
    height={BOTTOM_NAVBAR_FONT_SIZE}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    color="#000000"
  >
    <path
      d="M3 9v10a2 2 0 002 2h14a2 2 0 002-2V9"
      stroke="#000000"
      strokeWidth="1.5"
    ></path>
    <path
      d="M20.485 3h-3.992l.5 5s1 1 2.5 1a3.23 3.23 0 002.139-.806.503.503 0 00.15-.465L21.076 3.5A.6.6 0 0020.485 3z"
      stroke="#000000"
      strokeWidth="1.5"
    ></path>
    <path
      d="M16.493 3l.5 5s-1 1-2.5 1-2.5-1-2.5-1V3h4.5z"
      stroke="#000000"
      strokeWidth="1.5"
    ></path>
    <path
      d="M11.993 3v5s-1 1-2.5 1-2.5-1-2.5-1l.5-5h4.5z"
      stroke="#000000"
      strokeWidth="1.5"
    ></path>
    <path
      d="M7.493 3H3.502a.6.6 0 00-.592.501L2.205 7.73c-.029.172.02.349.15.465.328.29 1.061.806 2.138.806 1.5 0 2.5-1 2.5-1l.5-5z"
      stroke="#000000"
      strokeWidth="1.5"
    ></path>
  </svg>
);

const TOP_LEVEL_MOBILE_TABS = [
  {
    icon: HomeIcon,
    label: "Home",
    accessibilityLabel: "Home",
    key: TopLevelRoute.Home,
    href: "/" + TopLevelRoute.Home,
  },
  {
    icon: ShopIcon,
    label: "Shop",
    accessibilityLabel: "Shop",
    key: TopLevelRoute.Store,
    href: "/" + TopLevelRoute.Store,
  },
  {
    icon: BagIcon,
    label: "Checkout",
    accessibilityLabel: "Home",
    key: TopLevelRoute.Checkout,
    href: "/" + TopLevelRoute.Checkout,
  },
] as const;

const SET_OF_TOP_LEVEL_ROUTES = new Set<TopLevelRoute>(
  TOP_LEVEL_MOBILE_TABS.map((tab) => tab.key)
);

export { MobileNavbar };
