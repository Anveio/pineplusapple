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
import tailwindStylesheetUrl from "./styles/tailwind.css";
import indexStylesheetUrl from "./styles/index.css";

import { hijackEffects } from "stop-runaway-react-effects";
import { ClientNetworkLayer } from "./features/client-network-layer";
import { TopNavBar } from "./features/nav-bar";
import { MobileNavbar } from "./features/nav-bar/mobile-nav-bar";
import { BACKGROUND_COLOR_CLASSNAMES, TEXT_COLOR_CLASSNAMES } from "./shared";
import { FixedBottomStack } from "./components/FixedBottomStack";
import { MobileSignInBanner } from "./features/mobile-signin-banner";
import { ModalLayer } from "./features/modal-layer/ModalLayer";

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
        <body className={colorScheme + " relative "}>
          <ModalLayer />
          <div
            id="themed-background-singleton"
            className={
              "min-h-screen overflow-x-hidden px-4 transition-colors duration-300 dark:text-white xl:px-0" +
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
            <MobileNavbar />
          </FixedBottomStack>
        </body>
      </html>
    </ClientNetworkLayer>
  );
}

if (process.env.NODE_ENV === "development") {
  hijackEffects();
}
