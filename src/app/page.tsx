import { SignedIn, SignedOut } from "@clerk/nextjs";
import { getImagesForUser } from "@/db/queries";
import dynamic from "next/dynamic";

const LazyFullPageDropzone = dynamic(
  () => import("./_components/full-page-dropzone"),
  {
    ssr: false,
  }
);

async function Images() {
  const data = await getImagesForUser();
  return <LazyFullPageDropzone images={data} />;
}

export const runtime = "edge";

export default async function Home() {
  return (
    <div className="flex items-center">
      <SignedIn>
        <Images />
      </SignedIn>
    </div>
  );
}
