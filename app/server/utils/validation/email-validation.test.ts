import { getEmailValidationErrors } from "./email-validation";

describe("validation functions", () => {
  describe("validateEmail", () => {
    it("should return success:false and error.message:Invalid email for an empty email", () => {
      const result = getEmailValidationErrors("");
      expect(result).toBe("Invalid email");
    });
  });
});
