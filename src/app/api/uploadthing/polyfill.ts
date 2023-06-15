import { File } from "undici";
if (typeof window === "undefined") {
  // @ts-expect-error - polyfill for server
  globalThis.File = File;
}
