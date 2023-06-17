import { createNextRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

export const revalidate = 0;
export const fetchCache = "force-no-store";

// Export routes for Next App Router
export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter,
});
