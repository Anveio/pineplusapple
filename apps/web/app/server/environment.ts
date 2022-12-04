import { z } from "zod";

const EnvironmentString = z.string({
  required_error:
    "You forgot to set the SESSION_SECRET environment variable. Run `fly secrets set SESSION_SECRET=$(openssl rand -hex 32) --app pineplusapple` to set it",
  invalid_type_error:
    "You forgot to set the SESSION_SECRET environment variable. Run `fly secrets set SESSION_SECRET=$(openssl rand -hex 32) --app pineplusapple` to set it",
});

export const SESSION_SECRET = EnvironmentString.parse(
  process.env.SESSION_SECRET
);
