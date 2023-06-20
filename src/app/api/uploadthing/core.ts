import { db } from "@/db";
import { uploadedImage } from "@/db/schema";
import { currentUser } from "@clerk/nextjs";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { eq } from "drizzle-orm";
import { uploadTransparent } from "./make-transparent-file";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 20 } })
    .middleware(async (req) => {
      const user = await currentUser();

      if (!user || !user.id || !user.privateMetadata.enabled)
        throw new Error("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
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

  transparentUploader: f({ image: { maxFileSize: "16MB", maxFileCount: 20 } })
    .middleware(async (req) => {
      return { userId: "serverside" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("uploaded extra transparent file", file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
