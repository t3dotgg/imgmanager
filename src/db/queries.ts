import { auth } from "@clerk/nextjs";
import { db } from ".";
import { uploadedImage } from "./schema";
import { desc, eq } from "drizzle-orm";

export const getImagesForUser = async () => {
  const user = await auth();
  if (!user.userId) return [];

  return await db.query.uploadedImage.findMany({
    where: eq(uploadedImage.userId, user.userId),
    orderBy: desc(uploadedImage.id),
  });
};

type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

export type ImageFromDb = Awaited<ReturnType<typeof getImagesForUser>>[0];

export const getGroupedImagesForUser = async () => {
  const images = await getImagesForUser();

  const imagesByDate = images.reduce(
    (acc: Record<string, ImageFromDb[]>, image) => {
      const date = image.createdAt.toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(image);
      return acc;
    },
    {}
  );

  return imagesByDate;
};
