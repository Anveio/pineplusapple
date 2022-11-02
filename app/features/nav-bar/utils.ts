import type { useLocation } from "@remix-run/react";
import * as z from "zod";

/**
 * The valid string values for pineplusapple.com/{TopLevelRoute}/whatever/sub/route
 */
enum TopLevelRoute {
  Home = "",
  Store = "store",
  Cart = "cart",
}

export const MOBILE_TOP_LEVEL_TABS = [
  {
    icon: "🏠",
    label: "Home",
    key: TopLevelRoute.Home,
    href: "/" + TopLevelRoute.Home,
  },
  {
    icon: "🏷️",
    label: "Shop",
    key: TopLevelRoute.Shop,
    href: "/" + TopLevelRoute.Shop,
  },
  {
    icon: "🛒",
    label: "Cart",
    key: TopLevelRoute.Cart,
    href: "/" + TopLevelRoute.Cart,
  },
] as const;

export const validateTopLevelRoute = z.nativeEnum(TopLevelRoute).safeParse;

export const getTopLevelRoute = (location: ReturnType<typeof useLocation>) => {
  const topLevelRoute = location.pathname.split("/")[1];

  const validatedTopLevelRoute = validateTopLevelRoute(topLevelRoute);

  if (validatedTopLevelRoute.success) {
    return validatedTopLevelRoute.data;
  } else {
    return TopLevelRoute.Home; // Default
  }
};
