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
import { getColorSchemeSession } from "./features/color-scheme/color-scheme-utils.server";
import {
  colorSchemeStore,
  useColorSchemeClientServerSync,
} from "./features/color-scheme/color-scheme-store";

import { getUser } from "./session.server";
import tailwindStylesheetUrl from "./styles/tailwind.css";

import { hijackEffects } from "stop-runaway-react-effects";
import { ClientNetworkLayer } from "./features/client-network-layer";
import { MobileNavbar } from "./features/nav-bar/mobile-nav-bar";
import { Body } from "./components/Body";
import { TopNavBar } from "./features/nav-bar";
import { PageWrapper } from "./components/PageWrapper";
import { AnimatePresence } from "framer-motion";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Remix Notes",
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
  console.log("🚀 ~ file: root.tsx ~ line 55 ~ App ~ colorScheme", colorScheme);

  useColorSchemeClientServerSync(colorScheme);
  return (
    <ClientNetworkLayer>
      <html lang="en">
        <head>
          <Meta />
          <Links />
        </head>
        <body className={colorScheme + " min-h-screen"}>
          <div
            id="themed-background-singleton"
            className={
              "h-full min-h-screen w-full flex-col overflow-x-hidden bg-slate-50 text-black transition-colors duration-300 dark:bg-zinc-900 dark:text-white"
            }
          >
            <TopNavBar />
            <AnimatePresence mode="wait">
              <Outlet />
            </AnimatePresence>
            <MobileNavbar />
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </div>
        </body>
      </html>
    </ClientNetworkLayer>
  );
}

if (process.env.NODE_ENV === "development") {
  hijackEffects();
}
