import { z } from "zod";

const EnvironmentString = z.string();

export const SESSION_SECRET = EnvironmentString.parse(
  process.env.SESSION_SECRET
);
