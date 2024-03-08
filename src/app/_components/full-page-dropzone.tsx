"use client";

import type { ImageFromDb } from "@/db/queries";
import React, { useEffect, useMemo, useState, useTransition } from "react";
import { usePageDropzone } from "./use-page-dropzone";

import { generateReactHelpers } from "@uploadthing/react/hooks";

import clsx from "clsx";
import { OurFileRouter } from "../api/uploadthing/core";
import { useRouter } from "next/navigation";
import GroupedImageGrid, { ImageGrid } from "./image-grid";
import { useSelectStore } from "./selection/store";
import { deleteImages } from "../actions/deleteImages";
import { reprocessImages } from "../actions/reprocessImages";

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
        <button
          onClick={() =>
            reprocessImages(store.selectedIds).then((response) => {
              console.log("response?", response);
              store.clearAll();
              refresh();
            })
          }
          className="rounded-xl bg-green-800 px-2"
        >
          Reprocess
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
    let cancelled = false;
    if (props.upload) {
      console.log("PLAN: ", props.file.name);

      // When I upgraded to Next 14, this started to fire twice in close succcession, so I "fixed" it.
      const timeout = setTimeout(() => {
        if (cancelled) {
          console.log("cancelled upload for...", props.file.name);
          return;
        }
        console.log("START: ", props.file.name);
        uploadFiles("imageUploader", {
          files: [props.file],
          skipPolling: true,
        }).then(() => {
          console.log("done uploading", props.file.name);
          startTransition(() => {
            props.removeImage();
            refresh();
          });
        });
      }, 400);

      return () => {
        cancelled = true;
        clearTimeout(timeout);
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.file.name, props.upload]);

  useEffect(() => {
    return () => {
      console.log("unrendering", props.file.name);
    };
  }, []);

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

export default function FullPageDropzone(props: { images: ImageFromDb[] }) {
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (files.length === 0) return;
    console.log("Files", files);
  }, [files]);

  const { isDragging } = usePageDropzone((f) =>
    setFiles((oF) => [...oF, ...f])
  );

  const genContent = () => {
    if (props.images.length === 0 && files.length === 0) {
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
          <GroupedImageGrid images={props.images} />
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
