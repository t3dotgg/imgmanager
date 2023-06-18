"use client";

import type { ImageFromDb } from "@/db/queries";
import { useEffect, useState } from "react";
import { MagicImageRender } from "./magic-image";
import { usePageDropzone } from "./use-page-dropzone";

import clsx from "clsx";

const UploadingImage = (props: { file: File }) => {
  return <img src={URL.createObjectURL(props.file)} />;
};

export const FullPageDropzone = (props: { images: ImageFromDb[] }) => {
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (files.length === 0) return;
    console.log("Files", files);
  }, [files]);

  const { isDragging } = usePageDropzone(setFiles);

  if (props.images.length === 0)
    return <div className="text-2xl">Upload something</div>;

  return (
    <div
      className={clsx(["w-full"], {
        "bg-slate-700/20": isDragging,
      })}
    >
      <div className="grid h-full grid-cols-fluid justify-items-center overflow-y-scroll">
        {files.map((file, index) => (
          <UploadingImage file={file} key={index} />
        ))}
        {props.images.map((rn) => (
          <div key={rn.id} className="flex justify-between">
            <MagicImageRender image={rn} />
          </div>
        ))}
      </div>

      {isDragging && (
        <div className="absolute right-0 top-0 z-20 flex h-screen w-full bg-slate-600/50 p-4">
          <div className="sticky top-0 flex h-full w-full items-center justify-center rounded border-2 border-dashed border-white bg-slate-600 text-2xl">
            UPLOAD FILES
          </div>
        </div>
      )}
    </div>
  );
};
