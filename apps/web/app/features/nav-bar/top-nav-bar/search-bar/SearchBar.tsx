import * as React from "react";
import { motion } from "framer-motion";
import {
  INVERTED_TEXT_COLOR_CLASSNAMES,
  TEXT_COLOR_CLASSNAMES,
} from "~/shared";
import {
  TOP_NAVBAR_FONT_SIZE,
  TOP_NAVBAR_FONT_SIZE_HEIGHT_CLASSNAME,
} from "../../constants";

interface Props {}

export const SearchBar: React.FC<Props> = (props) => {
  return (
    <motion.div
      className={
        "grid place-content-end place-items-center" + TEXT_COLOR_CLASSNAMES
      }
      initial={{}}
    >
      <div
        className={`relative grid w-full ${TOP_NAVBAR_FONT_SIZE_HEIGHT_CLASSNAME}`}
      >
        <input
          aria-labelledby="search-bar-icon"
          className={
            "h-full w-full appearance-none rounded-full py-2 px-6 pr-12" +
            INVERTED_TEXT_COLOR_CLASSNAMES
          }
        />
        <svg
          id="search-bar-icon"
          width={TOP_NAVBAR_FONT_SIZE}
          height={TOP_NAVBAR_FONT_SIZE}
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          fill="none"
          className={"absolute top-0 right-2 " + INVERTED_TEXT_COLOR_CLASSNAMES}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.5 15.5L19 19M5 11a6 6 0 1012 0 6 6 0 00-12 0z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </div>
    </motion.div>
  );
};
