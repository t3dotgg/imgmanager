"use client";

import type { ImageFromDb } from "@/db/queries";
import NextImage from "next/image";
import { useState } from "react";
import { Spinner } from "./loading-spinner";
import { useIdToggle } from "./selection/store";
import clsx from "clsx";

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
  // For when doing copying
  const [loading, setLoading] = useState(false);
  // For when copying is done
  const [done, setDone] = useState(false);

  const { toggle, isSelected } = useIdToggle(image.fileKey);

  return (
    <div
      className={clsx(
        "relative flex w-full flex-col items-center justify-center hover:bg-gray-700/40 hover:opacity-80",
        {
          "border-8 border-red-500 bg-gray-800": isSelected,
          "p-2": !isSelected,
        }
      )}
      onClick={() => {
        console.log("copying image", image);
        toggle();
        // setLoading(true);
        // downloadAndCopyImageToClipboard(
        //   image.removedBgUrl ?? image.originalUrl ?? ""
        // ).then(() => {
        //   setLoading(false);
        //   setDone(true);
        //   setTimeout(() => {
        //     setDone(false);
        //   }, 1000);
        // });
      }}
    >
      <div className="relative h-48 w-full">
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
