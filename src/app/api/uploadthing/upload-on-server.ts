import "./polyfill";
import { blob } from "node:stream/consumers";

import { Readable } from "stream";
import { DANGEROUS__uploadFiles } from "uploadthing/client";

export const uploadFileOnServer = async (url: string) => {
  console.log("uploading file from url on server");
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
    { files: [mockFile], endpoint: "transparentUploader" },

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
