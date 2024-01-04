"use server";

import { db } from "@/db";
import { uploadedImage } from "@/db/schema";
import { auth } from "@clerk/nextjs";
import { and, eq, inArray } from "drizzle-orm";
import { inngest } from "@/pages/api/inngest";

export async function reprocessImages(images: string[]) {
  const user = await auth();
  if (!user.userId) throw new Error("not logged in");

  const orgOrUser = user.orgId
    ? eq(uploadedImage.orgId, user.orgId)
    : eq(uploadedImage.userId, user.userId);

  const toProcess = await db
    .select()
    .from(uploadedImage)
    .where(and(orgOrUser, inArray(uploadedImage.fileKey, images)));

  const results = toProcess.map((image) => {
    console.log("Sending image", image.id, image.fileKey);
    return inngest.send({
      name: "gen/transparent",
      data: { imageUrl: image.originalUrl, fileKey: image.fileKey },
    });
  });

  const awaitedResults = await Promise.all(results);

  console.log("RESULTS", awaitedResults);

  return "done!";
}
