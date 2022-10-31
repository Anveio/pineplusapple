import { render } from "@testing-library/react";
import React from "react";
import { act } from "react-dom/test-utils";
import { colorSchemeStore } from "~/features/color-scheme";
import { ColorScheme } from "~/features/color-scheme/color-scheme-constants";
import { Body } from "./Body";

// Need this to avoid validDOMNesting warnings because we're rendering
// a <body> element inside of a <div> element by default.
const DEFAULT_RENDER_CONTAINER = document.createElement("html");

describe("<Body />", () => {
  it("should render with light color scheme class name when initial match media query returns true", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => {
        return {
          matches: true, // Light mode
        };
      })
    );
    const { container } = render(<Body />, {
      container: DEFAULT_RENDER_CONTAINER,
    });

    const body = container.querySelector("body.light");
    expect(body).toBeTruthy();
  });

  it("should render with dark color scheme class name when initial match media query returns false", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => {
        return {
          matches: false, // Light mode
        };
      })
    );
    const { container } = render(<Body />, {
      container: DEFAULT_RENDER_CONTAINER,
    });

    const body = container.querySelector("body.light");
    expect(body).toBeTruthy();
  });

  it("should rerender correctly when updating the color scheme store", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => {
        return {
          matches: false, // Light mode
        };
      })
    );
    const { container, rerender } = render(<Body />, {
      container: DEFAULT_RENDER_CONTAINER,
    });

    const body = container.querySelector("body.light");
    expect(body).toBeTruthy();

    act(() => {
      colorSchemeStore.setState({ colorScheme: ColorScheme.DARK });
    });

    rerender(<Body />);

    expect(container.querySelector("body.dark")).toBeTruthy();

    act(() => {
      colorSchemeStore.setState({ colorScheme: ColorScheme.LIGHT });
    });

    rerender(<Body />);

    expect(container.querySelector("body.light")).toBeTruthy();
  });
});
