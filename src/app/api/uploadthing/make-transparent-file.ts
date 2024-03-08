import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export const uploadTransparent = async (inputUrl: string) => {
  if (!process.env.REMOVEBG_KEY) throw new Error("No removebg key");

  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_url", inputUrl);

  const res = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    body: formData,
    headers: {
      "X-Api-Key": process.env.REMOVEBG_KEY,
    },
    next: {
      revalidate: 0,
    },
  });

  if (!res.ok) {
    console.error("Got an error in response", res.status, res.statusText);
    console.error(await res.text());
    return { error: "unable to process image at this time" };
  }

  const fileBlob = await res.blob();

  console.log("got file from remove bg");

  const mockFile = Object.assign(fileBlob, { name: "transparent.png" });

  const uploadedFile = await utapi.uploadFiles(mockFile);

  return uploadedFile;
};
