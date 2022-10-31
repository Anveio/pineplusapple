import { Link, useLocation } from "@remix-run/react";
import { motion } from "framer-motion";
import * as React from "react";
import { getTopLevelRoute, MOBILE_TOP_LEVEL_TABS } from "../utils";

const TopNavBar: React.FC = () => {
  const location = useLocation();

  const currentTopLevelRoute = getTopLevelRoute(location);

  return (
    <nav className="fixed bottom-0 z-10 flex w-screen justify-center p-1">
      <ul
        className={`grid w-full max-w-screen-sm grid-cols-3 rounded-full bg-gray-200  text-black`}
      >
        {MOBILE_TOP_LEVEL_TABS.map((item) => {
          const isActiveTab = item.key === currentTopLevelRoute;

          return (
            <Link
              key={item.key}
              role={"listitem"}
              tabIndex={0}
              className={`focus:greyscale-0 hover:greyscale-0 relative flex select-none justify-center p-3 ${
                isActiveTab ? "greyscale-0" : "grayscale"
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
              <div className="z-30 flex items-center">
                <span className="text-2xl">{`${item.icon}`}</span>
                <span className="ml-2 hidden text-xl min-[460px]:inline-block ">
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

export { TopNavBar };
