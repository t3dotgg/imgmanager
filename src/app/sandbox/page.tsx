import { db } from "@/db";
import { uploadTransparentAlt } from "../api/uploadthing/make-transparent-cheaper";
import { uploadTransparent } from "../api/uploadthing/make-transparent-file";

import fs from "fs/promises";
import { uploadedImage } from "@/db/schema";

export const runtime = "nodejs";

async function doSomeWorkonServer() {
  "use server";

  const allImages = await db.query.uploadedImage.findMany();

  console.log("allImages", allImages.length, allImages[0]);

  // Write object to file as json
  await fs.writeFile("uploadthing.json", JSON.stringify(allImages));

  const resp = await uploadTransparent(
    "https://uploadthing-prod.s3.us-west-2.amazonaws.com/3d55b9a4-b7e6-4db7-94b0-cf671367b454_P1000028-0054.jpg"
  );

  console.log("on server", resp);
}

async function uploadImagesFromDump() {
  "use server";

  const imagesFromFile = await fs.readFile("uploadthing.json", "utf8");
  const images = JSON.parse(imagesFromFile);

  console.log("images", images);

  const addedToDb = await db.insert(uploadedImage).values(images);
}

export default function SandboxPage() {
  return (
    <div>
      <form action={doSomeWorkonServer}>
        <button type="submit">Download all images</button>
      </form>

      <form action={uploadImagesFromDump}>
        <button type="submit">Upload to db from dump</button>
      </form>
    </div>
  );
}
