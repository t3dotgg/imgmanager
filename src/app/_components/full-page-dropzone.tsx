"use client";

import type { ImageFromDb } from "@/db/queries";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import { MagicImageRender } from "./magic-image";
import { usePageDropzone } from "./use-page-dropzone";

import { generateReactHelpers } from "@uploadthing/react/hooks";

import clsx from "clsx";
import { OurFileRouter } from "../api/uploadthing/core";
import { useRouter } from "next/navigation";

const { uploadFiles } = generateReactHelpers<OurFileRouter>();

const SelectBar = () => {
  const store = useSelectStore();
  const { refresh } = useRouter();

  if (store.selectedIds.length === 0) return null;

  return (
    <div className="absolute bottom-0 right-0 z-50 flex w-full items-center justify-center p-4">
      <div className="flex items-center justify-center gap-4 bg-gray-800 px-4 py-2">
        <div>{store.selectedIds.length} selected</div>
        <button
          onClick={() =>
            deleteImages(store.selectedIds).then((response) => {
              console.log("response?", response);
              store.clearAll();
              refresh();
            })
          }
          className="rounded-xl bg-red-800 px-2"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const UploadingImage = (props: {
  file: File;
  upload: boolean;
  removeImage: () => void;
}) => {
  const { refresh } = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (props.upload) {
      uploadFiles({ files: [props.file], endpoint: "imageUploader" }).then(
        () => {
          startTransition(() => {
            props.removeImage();
            refresh();
          });
        }
      );
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

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import { groupImagesByDate } from "@/utils/group-images";
import { useSelectStore } from "./selection/store";
import { deleteImages } from "../deleteImage";
dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

const genTimestamp = (timestamp: string) => {
  const time = dayjs(timestamp);
  if (time.isToday()) return "Today";
  if (time.isYesterday()) return "Yesterday";
  return time.toDate().toLocaleDateString();
};

const ImageGrid: React.FC<{ children: React.ReactNode }> = (props) => (
  <div className="grid h-full grid-cols-fluid justify-items-center">
    {props.children}
  </div>
);

export default function FullPageDropzone(props: { images: ImageFromDb[] }) {
  const [files, setFiles] = useState<File[]>([]);

  const groupedImages = useMemo(() => {
    return groupImagesByDate(props.images);
  }, [props.images]);

  useEffect(() => {
    if (files.length === 0) return;
    console.log("Files", files);
  }, [files]);

  const { isDragging } = usePageDropzone((f) =>
    setFiles((oF) => [...oF, ...f])
  );

  const genContent = () => {
    if (Object.keys(groupedImages).length === 0 && files.length === 0) {
      return (
        <div className="w-full py-8 text-center text-2xl">Upload something</div>
      );
    }

    return (
      <>
        <div className="flex h-full w-full animate-fade-in-down flex-col overflow-y-scroll">
          {files.length > 0 && (
            <h3 className="p-4 text-2xl font-bold">Uploading...</h3>
          )}
          <SelectBar />
          <ImageGrid>
            {files.map((file, index) => (
              <UploadingImage
                key={file.name + "-uploading"}
                file={file}
                upload={files.length - index < 4}
                removeImage={() =>
                  setFiles((fileList) =>
                    fileList.filter(
                      (currentFile) => currentFile.name !== file.name
                    )
                  )
                }
              />
            ))}
          </ImageGrid>
          {Object.keys(groupedImages).map((imageGroupDate) => (
            <React.Fragment key={imageGroupDate}>
              <div className="flex w-full items-center py-4">
                <div className="h-0 w-12 border-2"></div>
                <h3 className="px-4 text-2xl font-bold">
                  {genTimestamp(imageGroupDate)}
                </h3>
                <div className="h-0 flex-grow border-2"></div>
              </div>
              <ImageGrid>
                {groupedImages[imageGroupDate].map((rn) => (
                  <MagicImageRender image={rn} key={rn.id} />
                ))}
              </ImageGrid>
            </React.Fragment>
          ))}
        </div>

        {isDragging && (
          <div className="absolute right-0 top-0 z-20 flex h-screen w-full bg-slate-600/50 p-4">
            <div className="sticky top-0 flex h-full w-full items-center justify-center rounded border-2 border-dashed border-white bg-slate-600 text-2xl">
              UPLOAD FILES
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div
      className={clsx(["w-full"], {
        "bg-slate-700/20": isDragging,
      })}
    >
      {genContent()}
    </div>
  );
}
