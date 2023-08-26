import { db } from "@/db";
import { uploadedImage } from "@/db/schema";
import { auth, currentUser } from "@clerk/nextjs";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { eq } from "drizzle-orm";
import { uploadTransparent } from "./make-transparent-file";
import { inngest } from "@/pages/api/inngest";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 20 } })
    .middleware(async (req) => {
      const user = await currentUser();
      const sesh = await auth();

      const orgId = sesh.orgId;

      if (!user || !user.id || !user.privateMetadata.enabled)
        throw new Error("Unauthorized");

      return { userId: user.id, orgId: orgId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);
      await db.insert(uploadedImage).values({
        userId: metadata.userId,
        orgId: metadata.orgId,
        fileKey: file.key,
        originalName: file.name,
        originalUrl: file.url,
      });

      inngest.send({
        name: "gen/transparent",
        data: { imageUrl: file.url, fileKey: file.key },
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
