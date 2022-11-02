import { Link, useLocation } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { getTopLevelRoute, TopLevelRoute } from "~/shared/utils";
import HomeIcon from "../../../../assets/home.png"
import StoreIcon from "../../../../assets/store.png"
import CartIcon from "../../../../assets/shopping-cart.png"
import UserIcon from "../../../../assets/profile.png"
import FavoriteIcon from "../../../../assets/favorite.png"

export const TOP_LEVEL_MOBILE_TABS = [
  {
    icon: HomeIcon,
    label: "",
    accessibilityLabel: "Home",
    key: TopLevelRoute.Home,
    href: "/" + TopLevelRoute.Home,
  },
  {
    icon: FavoriteIcon,
    label: "Favorites",
    accessibilityLabel: "Favorites",
    key: TopLevelRoute.Favorite,
    href: "/" + TopLevelRoute.Favorite,
  },
  {
    icon: StoreIcon,
    label: "Store",
    accessibilityLabel: "Store",
    key: TopLevelRoute.Shop,
    href: "/" + TopLevelRoute.Shop,
  },
  {
    icon: CartIcon,
    label: "Cart",
    accessibilityLabel: "Home",
    key: TopLevelRoute.Cart,
    href: "/" + TopLevelRoute.Cart,
  },
  {
    icon: UserIcon,
    label: "profile",
    accessibilityLabel: "Your Profile",
    key: TopLevelRoute.Profile,
    href: "/" + TopLevelRoute.Profile,
  },

] as const;

const SET_OF_TOP_LEVEL_ROUTES = new Set<TopLevelRoute>(
  TOP_LEVEL_MOBILE_TABS.map((tab) => tab.key)
);

const MobileNavbar: React.FC = () => {
  const location = useLocation();

  const currentTopLevelRoute = getTopLevelRoute(location);
  // The top level route can be a lot of things. If it's not one of the tabs, assume it's the home tab.
  const coercedToplevelRoute = SET_OF_TOP_LEVEL_ROUTES.has(currentTopLevelRoute)
    ? currentTopLevelRoute
    : TopLevelRoute.Home;

  return (
    <nav className="sm:hidden">
      <ul
        className={`grid max-w-screen-sm grid-cols-mobile-nav rounded-full bg-gray-200 mb-2 w-[96%] mx-auto text-black`}
      >
        {TOP_LEVEL_MOBILE_TABS.map((item) => {
          const isActiveTab = item.key === coercedToplevelRoute;

          return (
            <Link
              key={item.key}
              role={"listitem"}
              tabIndex={0}
              className={`relative flex select-none justify-center py-5 transition-all duration-300 hover:grayscale-0 ${
                isActiveTab ? "grayscale-0" : "grayscale"
              }`}
              to={item.href}
            >
              <AnimatePresence>
                {isActiveTab ? (
                  <motion.div
                    className="absolute top-0 h-full w-full rounded-full bg-zinc-300 dark:bg-white "
                    layoutId="nav-bubble"
                    transition={SELECTED_TAB_ANIMATION_CONFIG}
                  />
                ) : null}
              </AnimatePresence>
              <div className="z-30 flex items-center ">
                <img src={item.icon} alt="" aria-label={item.accessibilityLabel}/>
                <span className="text-m ml-2 hidden min-[460px]:inline-block ">
                  {item.label}
                </span>
              </div>
              <AnimatePresence>
                {isActiveTab ? (
                  <div className="absolute -bottom-px z-20 flex w-full justify-center">
                    <motion.div
                      className="h-1 w-4/6 rounded-full bg-emerald-500"
                      transition={SELECTED_TAB_ANIMATION_CONFIG}
                      layoutId="nav-underline"
                    />
                  </div>
                ) : null}
              </AnimatePresence>
            </Link>
          );
        })}
      </ul>
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

export { MobileNavbar };
