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
import { colorSchemeStore } from "./features/color-scheme/color-scheme-store";

import { getUser } from "./session.server";
import tailwindStylesheetUrl from "./styles/tailwind.css";

import { hijackEffects } from "stop-runaway-react-effects";
import { ClientNetworkLayer } from "./features/client-network-layer";
import { Navbar } from "./features/navigation-bar";

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

  colorSchemeStore.setState({
    colorScheme: colorScheme,
  });

  return (
    <ClientNetworkLayer>
      <html lang="en">
        <head>
          <Meta />
          <Links />
        </head>
        <body className={"h-full w-full " + colorScheme}>
          <Navbar />
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    </ClientNetworkLayer>
  );
}

if (process.env.NODE_ENV === "development") {
  hijackEffects();
}
