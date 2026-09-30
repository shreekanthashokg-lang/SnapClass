import { parseHttpUrl } from "./env";

/** The person credited for this website's design and engineering. Edit here to change every mention. */
export const AUTHOR = {
  name: "Shreekanth A Guttedar",
  credit: "Built by Shreekanth A Guttedar",
  github: parseHttpUrl(import.meta.env.VITE_AUTHOR_GITHUB) ?? "https://github.com/shreekanthashokg-lang",
  linkedin: parseHttpUrl(import.meta.env.VITE_AUTHOR_LINKEDIN),
} as const;
