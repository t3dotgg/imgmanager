import { uploadFileOnServer } from "./upload-on-server";

export const uploadTransparentAlt = async (inputUrl: string) => {
  if (!process.env.PROCESSOR_KEY) throw new Error("no key?");

  const url = inputUrl.replace("uploadthing.com", "utfs.io");

  console.log("resolving to url", url);

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
  console.log("image url:", contents);

  const fileUploaded = await uploadFileOnServer(contents.data.image);

  console.log("uploaded?", fileUploaded);

  return fileUploaded;
};
