import { db } from "@/db";
import { uploadedImage } from "@/db/schema";
import { auth } from "@clerk/nextjs";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { eq } from "drizzle-orm";
import { uploadTransparent } from "./make-transparent-file";

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
      return { userId: "serverside" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("uploaded extra transparent file", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
