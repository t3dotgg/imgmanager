"use client";

import type { ImageFromDb } from "@/db/queries";

async function downloadAndCopyImageToClipboard(imageUrl: string) {
  console.log("dc image");
  if (!navigator.clipboard) {
    console.error("Clipboard API not supported in this browser.");
    return;
  }

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Error fetching image: ${response.statusText}`);
    }

    const blob = await response.blob();
    const data = await (async () => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    })();

    const img: HTMLImageElement = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = data as string;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = img.width;
    canvas.height = img.height;
    if (!ctx) throw new Error("Could not get canvas context.");
    ctx.drawImage(img, 0, 0);

    const imageData: Blob = await new Promise((resolve) => {
      canvas.toBlob((a) => a && resolve(a));
    });

    await navigator.clipboard.write([
      new ClipboardItem({
        [imageData.type]: imageData,
      }),
    ]);

    console.log("Image copied to clipboard.");
  } catch (error) {
    console.error("Error copying image to clipboard:", error);
  }
}

export const MagicImageRender = ({ image }: { image: ImageFromDb }) => {
  return (
    <div className="flex w-56 items-center justify-center">
      <img
        src={image.removedBgUrl ?? image.originalUrl ?? ""}
        alt={image.originalName}
        className="w-full"
        onClick={() => {
          downloadAndCopyImageToClipboard(
            image.removedBgUrl ?? image.originalUrl ?? ""
          );
        }}
      />
    </div>
  );
};
