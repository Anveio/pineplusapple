import { Link, useLocation } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { BagIcon, HomeIcon, ShopIcon } from "~/components/Icons";
import { BACKGROUND_COLOR_CLASSNAMES } from "~/shared";
import { getTopLevelRoute, TopLevelRoute } from "~/shared/utils";
import { BOTTOM_NAVBAR_FONT_SIZE } from "../constants";

const MobileBottomNav: React.FC = () => {
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
          className={`grid w-full max-w-min grid-cols-mobile-nav rounded-full bg-terracotta-dust p-4 dark:bg-terracotta-konbu`}
        >
          {TOP_LEVEL_MOBILE_TABS.map((item) => {
            const isActiveTab = item.key === coercedToplevelRoute;

            return (
              <Link
                aria-label={item.label}
                key={item.key}
                tabIndex={0}
                role="listitem"
                className={`relative flex select-none justify-center p-4 text-terracotta-konbu transition-all duration-300 hover:grayscale-0  dark:text-lime-200 ${
                  isActiveTab ? "grayscale-0" : "grayscale"
                }`}
                to={item.href}
              >
                <div className={`z-30 flex items-center`}>{item.icon}</div>
                <AnimatePresence>
                  {isActiveTab ? (
                    <>
                      <motion.div
                        className="absolute -bottom-px z-20 flex h-1 w-full w-1/2 justify-center rounded-full bg-terracotta-konbu dark:bg-lime-200"
                        transition={SELECTED_TAB_ANIMATION_CONFIG}
                        layout
                        layoutId="nav-underline"
                      />
                      <motion.div
                        className="absolute top-0 h-full w-full rounded-full bg-terracotta-mango dark:bg-terracotta-liver  "
                        layout
                        layoutId="nav-bubble"
                        transition={SELECTED_TAB_ANIMATION_CONFIG}
                      />
                    </>
                  ) : null}
                </AnimatePresence>
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

const TOP_LEVEL_MOBILE_TABS = [
  {
    icon: <HomeIcon size={BOTTOM_NAVBAR_FONT_SIZE} />,
    label: "Home",
    accessibilityLabel: "Home",
    key: TopLevelRoute.Home,
    href: "/" + TopLevelRoute.Home,
  },
  {
    icon: <ShopIcon size={BOTTOM_NAVBAR_FONT_SIZE} />,
    label: "Shop",
    accessibilityLabel: "Shop",
    key: TopLevelRoute.SHOP,
    href: "/" + TopLevelRoute.SHOP,
  },
  {
    icon: <BagIcon size={BOTTOM_NAVBAR_FONT_SIZE} />,
    label: "Checkout",
    accessibilityLabel: "Home",
    key: TopLevelRoute.Checkout,
    href: "/" + TopLevelRoute.Checkout,
  },
] as const;

const SET_OF_TOP_LEVEL_ROUTES = new Set<TopLevelRoute>(
  TOP_LEVEL_MOBILE_TABS.map((tab) => tab.key)
);

export { MobileBottomNav };
