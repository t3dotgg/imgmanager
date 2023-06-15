// TODO: Handle `File` polyfilling for Node <20 support

import { Readable } from "stream";
import { DANGEROUS__uploadFiles } from "uploadthing/client";
import { File, Blob } from "web-file-polyfill";

function streamToBlob(stream: any, mimeType: any): any {
  if (mimeType != null && typeof mimeType !== "string") {
    throw new Error("Invalid mimetype, expected string.");
  }
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream
      .on("data", (chunk: any) => chunks.push(chunk))
      .once("end", () => {
        const blob =
          mimeType != null
            ? new Blob(chunks, { type: mimeType })
            : new Blob(chunks);
        resolve(blob);
      })
      .once("error", reject);
  });
}

export const uploadTransparent = async (url: string) => {
  if (!process.env.REMOVEBG_KEY) throw new Error("No removebg key");

  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_url", url);

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

  // Use this in dev when debugging

  // const { body } = await fetch(url, {
  //   next: {
  //     revalidate: 0,
  //   },
  // });

  const r = Readable.fromWeb(body as any);

  console.log("body?", body);

  const blobFromBody: Blob = await streamToBlob(r, "image/png");

  const f = new File([blobFromBody], "transparent.png", { type: "image/png" });

  const uploadedFiles = await DANGEROUS__uploadFiles(
    [f],
    "transparentUploader",

    // TODO: Make this unnecessary
    {
      url:
        (process.env.VERCEL_URL ?? "http://localhost:3000") +
        "/api/uploadthing",
    }
  );
  return uploadedFiles[0];
};
