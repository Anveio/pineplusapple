import {
  ColorScheme,
  getInitialUserPreferredColorScheme,
} from "~/features/color-scheme";

describe("color-scheme utils", () => {
  describe("getInitialUserPreferredColorScheme", () => {
    it(`should return ${ColorScheme.LIGHT} when initial match media query returns true`, () => {
      vi.stubGlobal(
        "matchMedia",
        vi.fn(() => {
          return {
            matches: false, // Light mode
          };
        })
      );

      expect(getInitialUserPreferredColorScheme()).toBe(ColorScheme.LIGHT);
    });

    it(`should return ${ColorScheme.DARK} when initial match media query returns false`, () => {
      vi.stubGlobal(
        "matchMedia",
        vi.fn(() => {
          return {
            matches: true, // Dark mode
          };
        })
      );

      expect(getInitialUserPreferredColorScheme()).toBe(ColorScheme.DARK);
    });
  });
});
