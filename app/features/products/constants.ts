import Commerce from "@chec/commerce.js";
import * as z from "zod";

const CommercePublicApiKeyValidator = z.string().startsWith("pk_");

const COMMERCE_PUBLIC_API_KEY = CommercePublicApiKeyValidator.parse(
  process.env.COMMERCE_PUBLIC_API_KEY
);

export const CommerceApi = new Commerce(COMMERCE_PUBLIC_API_KEY);
