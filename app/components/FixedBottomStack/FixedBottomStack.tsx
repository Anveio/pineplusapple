import * as React from "react";

interface Props extends React.PropsWithChildren {}

export const FixedBottomStack: React.FC<Props> = (props) => {
  return (
    <div className={"gap-sm fixed bottom-0 z-10 grid w-screen"}>
      {props.children}
    </div>
  );
};
