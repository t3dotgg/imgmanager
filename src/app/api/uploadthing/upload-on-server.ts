import "./polyfill";
import { blob } from "node:stream/consumers";

import { Readable } from "stream";
import { DANGEROUS__uploadFiles } from "uploadthing/client";

export const uploadFileOnServer = async (url: string) => {
  const { body } = await fetch(url, {
    next: {
      revalidate: 0,
    },
  });

  const r = Readable.fromWeb(body as any);

  const fileBlob = await blob(r);
  const mockFile = new File([fileBlob as any], "transparent.png", {
    type: "image/png",
  });

  const uploadedFiles = await DANGEROUS__uploadFiles(
    [mockFile],
    "transparentUploader",

    // TODO: Make this unnecessary
    {
      url:
        (process.env.VERCEL_URL
          ? "https://" + process.env.VERCEL_URL
          : "http://localhost:3000") + "/api/uploadthing",
    }
  );
  return uploadedFiles[0];
};
