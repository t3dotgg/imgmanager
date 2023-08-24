import "./polyfill";
import { blob } from "node:stream/consumers";

import { Readable } from "stream";
import { DANGEROUS__uploadFiles } from "uploadthing/client";
import { utapi } from "uploadthing/server";

export const uploadTransparent = async (inputUrl: string) => {
  if (!process.env.REMOVEBG_KEY) throw new Error("No removebg key");

  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_url", inputUrl);

  const { body } = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    body: formData,
    headers: {
      "X-Api-Key": process.env.REMOVEBG_KEY,
    },
    next: {
      revalidate: 0,
    },
  });

  const r = Readable.fromWeb(body as any);

  console.log("got file from remove bg");

  const fileBlob = await blob(r);
  const mockFile = new File([fileBlob as any], "transparent.png", {
    type: "image/png",
  });

  const uploadedFile = await utapi.uploadFiles(mockFile);

  return uploadedFile;
};
