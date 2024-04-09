import { db } from "@/db";
import { uploadTransparentAlt } from "../api/uploadthing/make-transparent-cheaper";
import { uploadTransparent } from "../api/uploadthing/make-transparent-file";

import fs from "fs/promises";

export const runtime = "nodejs";

async function doSomeWorkonServer() {
  "use server";

  // const allImages = await db.query.uploadedImage.findMany();

  // console.log("allImages", allImages.length, allImages[0]);

  // // Write object to file as json
  // await fs.writeFile("uploadthing.json", JSON.stringify(allImages));

  // const resp = await uploadTransparent(
  //   "https://uploadthing-prod.s3.us-west-2.amazonaws.com/3d55b9a4-b7e6-4db7-94b0-cf671367b454_P1000028-0054.jpg"
  // );

  // console.log("on server", resp);
}

export default function SandboxPage() {
  return (
    <form action={doSomeWorkonServer}>
      <button type="submit">Submit</button>
    </form>
  );
}
