import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export const uploadFileOnServer = async (url: string) => {
  console.log("uploading file from url on server");
  const res = await fetch(url, {
    next: {
      revalidate: 0,
    },
  });

  const fileBlob = await res.blob();
  const mockFile = Object.assign(fileBlob, { name: "transparent.png" });
  const response = await utapi.uploadFiles(mockFile);
  return response;
};
