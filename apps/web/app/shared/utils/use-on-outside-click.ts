import * as React from "react";

const MOUSEDOWN = "mousedown";
const TOUCHSTART = "touchstart";

const events: HandledEvents = [MOUSEDOWN, TOUCHSTART];

type HandledEvents = [typeof MOUSEDOWN, typeof TOUCHSTART];
type HandledEventsType = HandledEvents[number];
type PossibleEvent = {
  [Type in HandledEventsType]: HTMLElementEventMap[Type];
}[HandledEventsType];
type Handler = (event: PossibleEvent) => void;

export function useOnClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: Handler
) {
  const handlerRef = React.useRef(handler);

  React.useEffect(() => {
    const listener = (event: PossibleEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handlerRef.current(event);
    };

    events.forEach((event) => {
      document.addEventListener(event, listener, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, listener);
      });
    };
  }, [ref]);
}
