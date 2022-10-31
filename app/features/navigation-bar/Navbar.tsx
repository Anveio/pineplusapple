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
    icon: "🏠",
    label: "Home",
    key: TopLevelRoute.Home,
    href: "/" + TopLevelRoute.Home,
  },
  {
    icon: "🏷️",
    label: "Store",
    key: TopLevelRoute.Store,
    href: "/" + TopLevelRoute.Store,
  },
  {
    icon: "🛒",
    label: "Checkout",
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

const Navbar: React.FC = () => {
  const location = useLocation();

  const currentTopLevelRoute = getTopLevelRoute(location);

  return (
    <nav className="fixed bottom-0 z-10 flex w-screen justify-center">
      <ul
        className={`grid w-full max-w-screen-sm grid-cols-3 rounded-full bg-gray-200 text-2xl text-black`}
      >
        {TOP_LEVEL_NAVIGATION_TABS.map((item) => {
          const isActiveTab = item.key === currentTopLevelRoute;

          return (
            <li key={item.href} className="relative">
              <Link
                className={`flex justify-center rounded-full p-3 ${
                  isActiveTab ? "greyscale-0 bg-zinc-300 dark:bg-white" : "grayscale"
                }`}
                to={item.href}
              >{`${item.icon}`}</Link>
              {isActiveTab ? (
                <div className="absolute -bottom-px flex w-full justify-center">
                  <motion.div
                    className="h-1 w-5/6 bg-emerald-500"
                    layoutId="underline"
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export { Navbar };
