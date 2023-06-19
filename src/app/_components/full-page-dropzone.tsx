"use client";

import type { ImageFromDb } from "@/db/queries";
import { useEffect, useState, useTransition } from "react";
import { MagicImageRender } from "./magic-image";
import { usePageDropzone } from "./use-page-dropzone";

import { generateReactHelpers } from "@uploadthing/react/hooks";

import clsx from "clsx";
import { OurFileRouter } from "../api/uploadthing/core";
import { useRouter } from "next/navigation";
import NextImage from "next/image";

const { uploadFiles } = generateReactHelpers<OurFileRouter>();

const UploadingImage = (props: {
  file: File;
  upload: boolean;
  removeImage: () => void;
}) => {
  const { refresh } = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (props.upload) {
      uploadFiles([props.file], "imageUploader").then(() => {
        startTransition(() => {
          props.removeImage();
          refresh();
        });
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.file.name, props.upload]);

  return (
    <div className="relative flex w-full flex-col items-center justify-center hover:bg-gray-700/40 hover:opacity-80">
      <div className="relative h-48 w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={props.file.name + " is uploading..."}
          src={URL.createObjectURL(props.file)}
          className={clsx([
            "absolute h-full w-full object-contain",
            {
              "animate-pulse": props.upload,
              "opacity-50": !props.upload,
            },
          ])}
        />
      </div>
      <div>{props.file.name}</div>
    </div>
  );
};

export const FullPageDropzone = (props: { images: ImageFromDb[] }) => {
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (files.length === 0) return;
    console.log("Files", files);
  }, [files]);

  const { isDragging } = usePageDropzone((f) =>
    setFiles((oF) => [...oF, ...f])
  );

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
          <UploadingImage
            key={file.name + "-uploading"}
            file={file}
            upload={files.length - index < 4}
            removeImage={() =>
              setFiles((fileList) =>
                fileList.filter((currentFile) => currentFile.name !== file.name)
              )
            }
          />
        ))}
        {props.images.map((rn) => (
          <MagicImageRender image={rn} key={rn.id} />
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
