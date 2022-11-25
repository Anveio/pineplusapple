import type { useLocation } from "@remix-run/react";
import * as z from "zod";

/**
 * The valid string values for pineplusapple.com/{TopLevelRoute}/whatever/sub/route
 */
export enum TopLevelRoute {
  Home = "",
  SHOP = "shop",
  Checkout = "checkout",
  Profile = "profile",
  Join = "join",
  Login = "login",
}

const validateTopLevelRoute = z.nativeEnum(TopLevelRoute).safeParse;

export const getTopLevelRoute = (location: ReturnType<typeof useLocation>) => {
  const topLevelRoute = location.pathname.split("/")[1];

  const validatedTopLevelRoute = validateTopLevelRoute(topLevelRoute);

  if (validatedTopLevelRoute.success) {
    return validatedTopLevelRoute.data;
  } else {
    return TopLevelRoute.Home; // Default
  }
};
