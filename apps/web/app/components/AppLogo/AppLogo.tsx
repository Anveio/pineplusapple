import * as React from "react";

interface Props {
  size: string | number;
}

export const AppLogo: React.FC<
  Props & Omit<React.HTMLProps<HTMLDivElement>, "size">
> = (props) => {
  const PineTreeSvg = (
    <svg
      width={props.size}
      height={props.size}
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="currentColor"
    >
      <path
        d="M12 2L7 6.643S10.042 7 12 7c1.958 0 5-.357 5-.357L12 2zM8.5 7L5 10.94S7.625 12 12 12s7-1.06 7-1.06L15.5 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M6.5 11.5L3 15.523S5.7 18 12 18s9-2.477 9-2.477L17.5 11.5M12 22v-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );

  const PlusSvg = (
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
        d="M6 12h6m6 0h-6m0 0V6m0 6v6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );

  const AppleSvg = (
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
        d="M12.147 21.265l-.147-.03-.147.03c-2.377.475-4.62.21-6.26-1.1C3.964 18.86 2.75 16.373 2.75 12c0-4.473 1.008-6.29 2.335-6.954.695-.347 1.593-.448 2.735-.317 1.141.132 2.458.488 3.943.983l.26.086.255-.102c2.482-.992 4.713-1.373 6.28-.641 1.47.685 2.692 2.538 2.692 6.945 0 4.374-1.213 6.86-2.843 8.164-1.64 1.312-3.883 1.576-6.26 1.1z"
        stroke="currentColor"
        strokeWidth="1.5"
      ></path>
      <path
        d="M12 5.5C12 3 11 2 9 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );

  return (
    <div
      {...props}
      className={
        "grid grid-cols-3 gap-0.5 text-terracotta-konbu dark:text-lime-200 " +
          props.className || ""
      }
    >
      {PineTreeSvg}
      {PlusSvg}
      {AppleSvg}
    </div>
  );
};
