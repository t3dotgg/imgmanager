import { db } from "@/db";
import { uploadedImage } from "@/db/schema";
import { SignInButton, SignedIn, SignedOut, auth } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import ImageUploadButton from "./_components/upload-button";
import { uploadTransparent } from "./api/uploadthing/core";

async function testTransparentUploader() {
  "use server";
  const resp = await uploadTransparent(
    "https://uploadthing.com/f/69a8188c-181b-49be-8972-2cdd26c474eb_P1000035-0038.jpg"
  );
  return resp;
}

function TestForm() {
  return (
    <form
      action={testTransparentUploader}
      className="flex flex-col items-center"
    >
      <button
        type="submit"
        className="rounded border-2 bg-green-700 p-2 px-4 hover:bg-green-600"
      >
        Test
      </button>
    </form>
  );
}

const getImagesForUser = async () => {
  const user = await auth();
  if (!user.userId) return [];

  return await db.query.uploadedImage.findMany({
    where: eq(uploadedImage.userId, user.userId),
    orderBy: desc(uploadedImage.id),
  });
};

type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T;

type ImageFromDb = Awaited<ReturnType<typeof getImagesForUser>>[0];

const MagicImageRender = ({ image }: { image: ImageFromDb }) => {
  return (
    <div className="flex w-56 items-center justify-center">
      <img
        src={image.removedBgUrl ?? image.originalUrl ?? ""}
        alt={image.originalName}
        className="w-full"
      />
    </div>
  );
};

async function Images() {
  const data = await db.query.uploadedImage.findMany({
    orderBy: desc(uploadedImage.id),
  });

  if (data.length === 0)
    return <div className="text-2xl">Upload something</div>;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="flex flex-wrap justify-center gap-2">
        {data.map((rn) => (
          <div key={rn.id} className="flex justify-between">
            <MagicImageRender image={rn} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function Home() {
  return (
    <div className="flex flex-col items-center">
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <TestForm />
        <ImageUploadButton />
        <Images />
      </SignedIn>
    </div>
  );
}
