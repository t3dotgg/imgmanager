import { db } from "@/db";
import fs from "fs/promises";
import { uploadedImage } from "@/db/schema";

// // Run this while on old DB
// async function dumpImagesFromDB() {
//   "use server";
//   const allImages = await db.query.uploadedImage.findMany();

//   await fs.writeFile("db-dump.json", JSON.stringify(allImages));
// }

// // Run this while on new DB
// async function updateDBFromDump() {
//   "use server";
//   const imagesFromFile = await fs.readFile("db-dump.json", "utf8");

//   await db.insert(uploadedImage).values(JSON.parse(imagesFromFile));
// }

export default function SandboxPage() {
  return (
    <div>
      Empty sandbox
      {/* <form action={dumpImagesFromDB}>
        <button type="submit">Download all images</button>
      </form>

      <form action={updateDBFromDump}>
        <button type="submit">Upload to db from dump</button>
      </form> */}
    </div>
  );
}
