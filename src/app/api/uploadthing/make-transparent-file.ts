import "./polyfill";
import { blob } from "node:stream/consumers";

import { Readable } from "stream";
import { utapi } from "uploadthing/server";

export const uploadTransparent = async (inputUrl: string) => {
  if (!process.env.REMOVEBG_KEY) throw new Error("No removebg key");

  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_url", inputUrl);

  const res = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    body: formData,
    headers: {
      "X-Api-Key": process.env.REMOVEBG_KEY,
    },
    next: {
      revalidate: 0,
    },
  });

  if (!res.ok) {
    console.error("Got an error in response", res.status, res.statusText);
    console.error(await res.text());
    return { error: "unable to process image at this time" };
  }

  const r = Readable.fromWeb(res.body as any);

  console.log("got file from remove bg");

  const fileBlob = await blob(r);
  const mockFile = new File([fileBlob as any], "transparent.png", {
    type: "image/png",
  });

  const uploadedFile = await utapi.uploadFiles(mockFile);

  return uploadedFile;
};
