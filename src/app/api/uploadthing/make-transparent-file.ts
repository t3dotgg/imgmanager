import "./polyfill";
import { uploadFileOnServer } from "./upload-on-server";

export const uploadTransparent = async (url: string) => {
  if (!process.env.PROCESSOR_KEY) throw new Error("no key?");

  const form = new FormData();
  form.append("image_url", url);
  form.append("sync", "1");

  const response = await fetch(
    "https://techhk.aoscdn.com/api/tasks/visual/segmentation",
    {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.PROCESSOR_KEY,
      },
      body: form,
    }
  );

  const contents = (await response.json()) as { data: { image: string } };
  console.log("image url:", contents.data.image);

  const fileUploaded = await uploadFileOnServer(contents.data.image);

  console.log("uploaded?", fileUploaded);

  return fileUploaded;
};
