import { uploadFileOnServer } from "../api/uploadthing/upload-on-server";

export const runtime = "nodejs";

async function doSomeWorkonServer() {
  "use server";

  console.log("on server");
}

export default function SandboxPage() {
  return (
    <form action={doSomeWorkonServer}>
      <button type="submit">Submit</button>
    </form>
  );
}
