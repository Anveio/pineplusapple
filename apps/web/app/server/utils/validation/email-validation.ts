import * as z from "zod";

const schema = z.string().email();

export const getEmailValidationErrors = (email: FormDataEntryValue | null) => {
  const validationResult = schema.safeParse(email);

  if (validationResult.success === true) {
    throw new Error("Email is valid. No errors to return");
  }

  return validationResult.error.errors[0].message;
};

export const validateEmail = (
  email: FormDataEntryValue | null
): email is string => {
  return schema.safeParse(email).success;
};
