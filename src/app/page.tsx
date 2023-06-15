import { db } from "@/db";
import { uploadedImage } from "@/db/schema";
import { SignInButton, SignedIn, SignedOut, UserProfile } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function Images() {
  const data = await db.query.uploadedImage.findMany({
    orderBy: desc(uploadedImage.id),
  });

  if (data.length === 0)
    return <div className="text-2xl">Upload something</div>;

  return (
    <div className="flex max-w-sm flex-col gap-2 text-center">
      <div className="pb-4 text-2xl">
        Here are some random numbers stored in your DB:
      </div>

      {data.map((rn) => (
        <div key={rn.id} className="flex justify-between">
          <span>{rn.id}</span>
        </div>
      ))}
    </div>
  );
}

export default async function Home() {
  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <Images />
      </SignedIn>
    </div>
  );
}
