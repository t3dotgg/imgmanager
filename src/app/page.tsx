import { SignedIn, SignedOut } from "@clerk/nextjs";
import { getGroupedImagesForUser, getImagesForUser } from "@/db/queries";
import { FullPageDropzone } from "./_components/full-page-dropzone";

async function Images() {
  const data = await getGroupedImagesForUser();
  return <FullPageDropzone images={data} />;
}

export const runtime = "edge";

export default async function Home() {
  return (
    <div className="flex items-center">
      <SignedOut>Sign in above first</SignedOut>
      <SignedIn>
        <Images />
      </SignedIn>
    </div>
  );
}
