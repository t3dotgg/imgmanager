import { auth } from "@clerk/nextjs";
import { db } from ".";
import { uploadedImage } from "./schema";
import { and, desc, eq, isNull } from "drizzle-orm";

export const getImagesForUser = async () => {
  const user = await auth();
  if (!user.userId) return [];

  if (user.orgId) {
    return await db.query.uploadedImage.findMany({
      where: eq(uploadedImage.orgId, user.orgId),
      orderBy: desc(uploadedImage.id),
    });
  }

  return await db.query.uploadedImage.findMany({
    where: and(
      eq(uploadedImage.userId, user.userId),
      isNull(uploadedImage.orgId)
    ),
    orderBy: desc(uploadedImage.id),
  });
};

type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

export type ImageFromDb = Awaited<ReturnType<typeof getImagesForUser>>[0];
