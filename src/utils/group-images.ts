import type { ImageFromDb } from "@/db/queries";

export const groupImagesByDate = (images: ImageFromDb[]) => {
  const imagesByDate = images.reduce(
    (acc: Record<string, ImageFromDb[]>, image) => {
      const date = new Date(image.createdAt).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(image);
      return acc;
    },
    {}
  );

  return imagesByDate;
};
