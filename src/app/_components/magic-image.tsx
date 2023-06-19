"use client";

import type { ImageFromDb } from "@/db/queries";
import NextImage from "next/image";
import { useState } from "react";
import { Spinner } from "./loading-spinner";

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
  // For when doing copying
  const [loading, setLoading] = useState(false);
  // For when copying is done
  const [done, setDone] = useState(false);

  return (
    <div
      className="relative flex w-full flex-col items-center justify-center hover:bg-gray-700/40 hover:opacity-80"
      onClick={() => {
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
