import { db } from "@/db";
import { uploadedImage } from "@/db/schema";
import { auth } from "@clerk/nextjs";
import { createUploadthing, type FileRouter } from "uploadthing/next";

import { Readable } from "stream";
import { finished } from "stream/promises";
import fs from "fs";

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

      const formData = new FormData();
      formData.append("size", "auto");
      formData.append("image_url", file.url);

      const stream = fs.createWriteStream("test.png");
      const { body } = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        body: formData,
        headers: {
          "X-Api-Key": process.env.REMOVEBG_KEY!,
        },
      });

      console.log("created in db", createdInDb, file.url);

      if (!body) throw new Error("no body");
      await finished(Readable.fromWeb(body as any).pipe(stream));
      console.log("bg transparent written");
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
