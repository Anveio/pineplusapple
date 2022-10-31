import * as React from "react";
import { NavLink } from "react-router-dom";

import { ColorSchemeButton } from "../color-scheme";

const NavLinks = [
  {
    name: "Home",
    url: "/",
  },
  {
    name: "Shop",
    url: "/shop",
  },
  {
    name: "FAQ",
    url: "/faq",
  },
];

const Navbar: React.FC = () => {
  return (
    <nav className="md:py6 m-auto bg-slate-50 px-6 py-2 transition-colors duration-300 dark:bg-slate-800 sm:py-4">
      <div className="m-auto flex max-w-7xl flex-wrap items-center justify-between">
        <div className="flex flex-shrink-0 items-center text-black dark:text-white">
          <span
            className="text-2xl font-semibold tracking-tight"
            aria-label="Pine + Apple"
          >
            🌲+🍎
          </span>
        </div>
        <div className="z-10 hidden w-1/2 flex-row justify-between text-lg sm:block sm:flex">
          {NavLinks.map((link) => (
            <NavLink
              key={link.url}
              to={`${link.url}`}
              className="text-black duration-75 ease-in-out hover:text-emerald-700 dark:text-white dark:hover:text-emerald-700"
            >
              {link.name}
            </NavLink>
          ))}
        </div>
        <div className="hidden items-center sm:flex">
          <ColorSchemeButton />
        </div>
      </div>
    </nav>
  );
};

export { Navbar };
