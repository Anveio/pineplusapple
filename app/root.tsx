import type { LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { getInitialUserPreferredColorScheme } from "./features/color-scheme";
import { useColorSchemeClientServerSync } from "./features/color-scheme/color-scheme-store";
import { getColorSchemeSession } from "./features/color-scheme/color-scheme-utils.server";

import { getUser } from "./session.server";
import indexStylesheetUrl from "./styles/index.css";
import tailwindStylesheetUrl from "./styles/tailwind.css";

import { hijackEffects } from "stop-runaway-react-effects";
import { FixedBottomStack } from "./components/FixedBottomStack";
import { ClientNetworkLayer } from "./features/client-network-layer";
import { ModalLayer } from "./features/modal-layer/ModalLayer";
import { TopNavBar } from "./features/nav-bar";
import { MobileBottomNav } from "./features/nav-bar/mobile-bottom-nav";
import { BACKGROUND_COLOR_CLASSNAMES } from "./shared";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    { rel: "stylesheet", href: indexStylesheetUrl },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Pine + Apple",
  viewport: "width=device-width,initial-scale=1",
  description:
    "Online plant store, delivery of live exotic plants to your door, free shipping. Located in Seattle, Washington.",
});

export async function loader({ request }: LoaderArgs) {
  const colorSchemeSession = await getColorSchemeSession(request);

  return json({
    user: await getUser(request),
    colorScheme:
      colorSchemeSession.getColorScheme() ||
      getInitialUserPreferredColorScheme(),
  });
}

type LoaderType = Awaited<ReturnType<typeof loader>>["json"];

export default function App() {
  const loaderData = useLoaderData<LoaderType>();
  const { colorScheme } = loaderData;

  useColorSchemeClientServerSync(colorScheme);
  return (
    <ClientNetworkLayer>
      <html lang="en">
        <head>
          <Meta />
          <Links />
        </head>
        <body
          className={colorScheme + " relative transition-colors duration-300"}
        >
          
          <div
            id="themed-background-singleton"
            className={
              "min-h-screen overflow-x-hidden px-4 pb-[115px] transition-colors duration-300 dark:text-white sm:pb-0 xl:px-0" +
              BACKGROUND_COLOR_CLASSNAMES
            }
          >
            <TopNavBar />
            <Outlet />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </div>
          <FixedBottomStack>
            <MobileBottomNav />
          </FixedBottomStack>
        </body>
      </html>
    </ClientNetworkLayer>
  );
}

if (process.env.NODE_ENV === "development") {
  hijackEffects();
}
