import { db } from "@/db";
import { uploadedImage } from "@/db/schema";
import { auth } from "@clerk/nextjs";
import { createUploadthing, type FileRouter } from "uploadthing/next";

import { Readable } from "stream";
import { finished } from "stream/promises";
import fs from "fs";
import { DANGEROUS__uploadFiles } from "uploadthing/client";
import { eq } from "drizzle-orm";

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
  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_url", url);

  const { body } = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    body: formData,
    headers: {
      "X-Api-Key": process.env.REMOVEBG_KEY!,
    },
    next: {
      revalidate: 0,
    },
  });

  const r = Readable.fromWeb(body as any);

  console.log("body?", body);

  const blobFromBody: Blob = await streamToBlob(r, "image/png");

  console.log("done?", blobFromBody);

  const f = new File([blobFromBody], "test.png", { type: "image/png" });

  const uploadedFiles = await DANGEROUS__uploadFiles(
    [f],
    "transparentUploader",
    {
      url:
        (process.env.VERCEL_URL ?? "http://localhost:3000") +
        "/api/uploadthing",
    }
  );
  return uploadedFiles[0];
};

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 20 } })
    // Set permissions and file types for this FileRoute
    .middleware(async (req) => {
      // This code runs on your server before upload
      const user = await auth();

      // If you throw, the user will not be able to upload
      if (!user || !user.userId) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);
      const createdInDb = await db.insert(uploadedImage).values({
        userId: metadata.userId,
        fileKey: file.key,
        originalName: file.name,
        originalUrl: file.url,
      });

      const transparent = await uploadTransparent(file.url);

      if (!transparent.fileUrl) {
        console.error("UNABLE TO UPLOAD TRANSPARENT IMAGE FILE", file);
        return;
      }

      await db
        .update(uploadedImage)
        .set({
          removedBgUrl: transparent.fileUrl,
        })
        .where(eq(uploadedImage.fileKey, file.key));

      console.log("bg transparent written");
    }),

  transparentUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 20 } })
    .middleware(async (req) => {
      console.log("serverside?", req);
      return { userId: "serverside" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("uploaded extra transparent file", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
