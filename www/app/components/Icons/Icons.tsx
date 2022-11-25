import * as React from "react";

interface Props {
  size: string;
}

export const HomeIcon = (props: Props) => (
  <svg
    width={props.size}
    height={props.size}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    color="currentColor"
  >
    <path
      d="M3 9.5L12 4l9 5.5M19 13v6.4a.6.6 0 01-.6.6H5.6a.6.6 0 01-.6-.6V13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    ></path>
  </svg>
);

export const BagIcon = (props: Props) => (
  <svg
    width={props.size}
    height={props.size}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    color="currentColor"
  >
    <path
      d="M4.508 20h14.984a.6.6 0 00.592-.501l1.8-10.8A.6.6 0 0021.292 8H2.708a.6.6 0 00-.592.699l1.8 10.8a.6.6 0 00.592.501z"
      stroke="currentColor"
      strokeWidth="1.5"
    ></path>
    <path
      d="M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2"
      stroke="currentColor"
      strokeWidth="1.5"
    ></path>
  </svg>
);

export const ShopIcon = (props: Props) => (
  <svg
    width={props.size}
    height={props.size}
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    color="currentColor"
  >
    <path
      d="M3 9v10a2 2 0 002 2h14a2 2 0 002-2V9"
      stroke="currentColor"
      strokeWidth="1.5"
    ></path>
    <path
      d="M20.485 3h-3.992l.5 5s1 1 2.5 1a3.23 3.23 0 002.139-.806.503.503 0 00.15-.465L21.076 3.5A.6.6 0 0020.485 3z"
      stroke="currentColor"
      strokeWidth="1.5"
    ></path>
    <path
      d="M16.493 3l.5 5s-1 1-2.5 1-2.5-1-2.5-1V3h4.5z"
      stroke="currentColor"
      strokeWidth="1.5"
    ></path>
    <path
      d="M11.993 3v5s-1 1-2.5 1-2.5-1-2.5-1l.5-5h4.5z"
      stroke="currentColor"
      strokeWidth="1.5"
    ></path>
    <path
      d="M7.493 3H3.502a.6.6 0 00-.592.501L2.205 7.73c-.029.172.02.349.15.465.328.29 1.061.806 2.138.806 1.5 0 2.5-1 2.5-1l.5-5z"
      stroke="currentColor"
      strokeWidth="1.5"
    ></path>
  </svg>
);
