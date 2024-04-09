"use server";

import { db } from "@/db";
import { uploadedImage } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";

export async function deleteImages(images: string[]) {
  const user = await auth();
  if (!user.userId) throw new Error("not logged in");

  const orgOrUser = user.orgId
    ? eq(uploadedImage.orgId, user.orgId)
    : eq(uploadedImage.userId, user.userId);

  const deleted = await db
    .delete(uploadedImage)
    .where(and(orgOrUser, inArray(uploadedImage.fileKey, images)));

  return "done!";
}
