import { Link, useLocation } from "@remix-run/react";
import { motion } from "framer-motion";
import * as React from "react";
import * as z from "zod";

/**
 * The valid string values for pineplusapple.com/{TopLevelRoute}/whatever/sub/route
 */
enum TopLevelRoute {
  Home = "",
  Store = "store",
  Checkout = "checkout",
}

const TOP_LEVEL_NAVIGATION_TABS = [
  {
    icon: "🌲+🍎",
    label: "",
    accessibilityLabel: "Home",
    key: TopLevelRoute.Home,
    href: "/" + TopLevelRoute.Home,
  },
  {
    icon: "🏷️",
    label: "Store",
    accessibilityLabel: "Store",
    key: TopLevelRoute.Store,
    href: "/" + TopLevelRoute.Store,
  },
  {
    icon: "🛒",
    label: "Checkout",
    accessibilityLabel: "Home",
    key: TopLevelRoute.Checkout,
    href: "/" + TopLevelRoute.Checkout,
  },
] as const;

const validateTopLevelRoute = z.nativeEnum(TopLevelRoute).safeParse;

const getTopLevelRoute = (location: ReturnType<typeof useLocation>) => {
  const topLevelRoute = location.pathname.split("/")[1];

  const validatedTopLevelRoute = validateTopLevelRoute(topLevelRoute);

  if (validatedTopLevelRoute.success) {
    return validatedTopLevelRoute.data;
  } else {
    return TopLevelRoute.Home; // Default
  }
};

const MobileNavbar: React.FC = () => {
  const location = useLocation();

  const currentTopLevelRoute = getTopLevelRoute(location);

  return (
    <nav className="fixed bottom-0 z-10 block flex w-screen justify-center  sm:hidden">
      <ul
        className={`grid w-full max-w-screen-sm grid-cols-mobile-nav rounded-full bg-gray-200  text-black`}
      >
        {TOP_LEVEL_NAVIGATION_TABS.map((item) => {
          const isActiveTab = item.key === currentTopLevelRoute;

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
              {isActiveTab ? (
                <motion.div
                  className="absolute top-0 h-full w-full rounded-full bg-zinc-300 dark:bg-white "
                  layoutId="nav-bubble"
                  transition={SELECTED_TAB_ANIMATION_CONFIG}
                />
              ) : null}
              <div className="z-30 flex items-center ">
                <span className="text-xl">{`${item.icon}`}</span>
                <span className="text-l ml-2 hidden min-[460px]:inline-block ">
                  {item.label}
                </span>
              </div>
              {isActiveTab ? (
                <div className="absolute -bottom-px z-20 flex w-full justify-center">
                  <motion.div
                    className="h-1 w-4/6 rounded-full bg-emerald-500"
                    transition={SELECTED_TAB_ANIMATION_CONFIG}
                    layoutId="nav-underline"
                  />
                </div>
              ) : null}
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
