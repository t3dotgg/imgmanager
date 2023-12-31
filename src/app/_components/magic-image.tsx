"use client";

import type { ImageFromDb } from "@/db/queries";
import NextImage from "next/image";
import { useState } from "react";
import { Spinner } from "./loading-spinner";
import { useIdToggle } from "./selection/store";
import clsx from "clsx";
import { useAuth } from "@clerk/nextjs";

async function downloadAndCopyImageToClipboard(imageUrl: string) {
  console.log("dc image", imageUrl);
  if (!navigator.clipboard) {
    console.error("Clipboard API not supported in this browser.");
    return;
  }

  try {
    const img: HTMLImageElement = await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.src = imageUrl;
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
  const { isSignedIn } = useAuth();
  // For when doing copying
  const [loading, setLoading] = useState(false);
  // For when copying is done
  const [done, setDone] = useState(false);

  // For selection (for deletion)
  const { toggle, isSelected } = useIdToggle(image.fileKey);

  return (
    <div className="group relative flex w-full flex-col items-center justify-center hover:bg-gray-700/40 hover:opacity-80">
      {isSignedIn && (
        <input
          type="checkbox"
          className={clsx(
            "absolute right-0 top-0 z-10 m-4 hidden h-4 w-4 group-hover:block"
          )}
          // Overwrite style if selected
          style={isSelected ? { display: "block" } : {}}
          checked={isSelected}
          onChange={toggle}
        />
      )}
      <div
        className="relative h-48 w-full"
        onClick={() => {
          console.log("copying image", image);
          setLoading(true);
          downloadAndCopyImageToClipboard(
            image.removedBgUrl ?? image.originalUrl ?? ""
          ).then(() => {
            setLoading(false);
            setDone(true);
            setTimeout(() => {
              setDone(false);
            }, 1000);
          });
        }}
      >
        <NextImage
          src={image.removedBgUrl ?? image.originalUrl ?? ""}
          alt={image.originalName}
          className="object-contain"
          fill={true}
          sizes="192px"
        />
      </div>

      {loading && (
        <div className="absolute">
          <Spinner />
        </div>
      )}

      {done && (
        <div className="absolute">
          <div className="text-2xl font-bold text-white">Copied!</div>
        </div>
      )}

      <div>{image.originalName}</div>
    </div>
  );
};
