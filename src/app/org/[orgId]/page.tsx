import { getImagesForOrg } from "@/db/queries";
import dynamic from "next/dynamic";

const LazyGroupedImageGrid = dynamic(
  () => import("../../_components/full-page-dropzone"),
  {
    ssr: false,
  }
);

export const runtime = "edge";

export default async function Home(props: { params: { orgId: string } }) {
  const data = await getImagesForOrg(props.params.orgId);
  return (
    <div className="flex items-center">
      <LazyGroupedImageGrid images={data} />
    </div>
  );
}
