import React, { useEffect, useMemo, useState, useTransition } from "react";
import { MagicImageRender } from "./magic-image";
import type { ImageFromDb } from "@/db/queries";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import { groupImagesByDate } from "@/utils/group-images";
dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

const genTimestamp = (timestamp: string) => {
  const time = dayjs(timestamp);
  if (time.isToday()) return "Today";
  if (time.isYesterday()) return "Yesterday";
  return time.toDate().toLocaleDateString();
};

export const ImageGrid: React.FC<{ children: React.ReactNode }> = (props) => (
  <div className="grid h-full grid-cols-fluid justify-items-center">
    {props.children}
  </div>
);

export default function GroupedImageGrid(props: { images: ImageFromDb[] }) {
  const groupedImages = useMemo(() => {
    return groupImagesByDate(props.images);
  }, [props.images]);
  return (
    <>
      {Object.keys(groupedImages).map((imageGroupDate) => (
        <React.Fragment key={imageGroupDate}>
          <div className="flex w-full items-center px-4 py-8">
            <div className="mx-4 h-0 w-12 border-b border-slate-300" />
            <h3 className="text-2xl text-slate-300">
              {genTimestamp(imageGroupDate)}
            </h3>
            <div className="mx-4 h-0 flex-grow border-b border-slate-300" />
          </div>
          <ImageGrid>
            {groupedImages[imageGroupDate].map((rn) => (
              <MagicImageRender image={rn} key={rn.id} />
            ))}
          </ImageGrid>
        </React.Fragment>
      ))}
    </>
  );
}
