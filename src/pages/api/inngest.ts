import { uploadTransparent } from "@/app/api/uploadthing/make-transparent-file";
import { db } from "@/db";
import { uploadedImage } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Inngest, NonRetriableError, slugify } from "inngest";
import { serve } from "inngest/next";

// Create a client to send and receive events
export const inngest = new Inngest({ id: slugify("Img Manager") });

const makeImageTransparent = inngest.createFunction(
  {
    id: "gen/transparent",
    rateLimit: {
      period: "60s",
      limit: 50,
    },
  },
  { event: "gen/transparent" },
  async ({ event, step }) => {
    console.log("image?", event.data.imageUrl, event.data.fileKey);

    if (!event.data.imageUrl || typeof event.data.imageUrl !== "string")
      throw new NonRetriableError("No image url");

    const transparent = await uploadTransparent(event.data.imageUrl);
    console.log("transparent response generated and uploaded", transparent);

    if (!transparent.data?.url) {
      console.error("UNABLE TO UPLOAD TRANSPARENT IMAGE FILE", event);
      throw new Error(
        "Unable to process and upload transparent image, retrying"
      );
    }

    await db
      .update(uploadedImage)
      .set({
        removedBgUrl: transparent.data?.url,
      })
      .where(eq(uploadedImage.fileKey, event.data.fileKey));

    return { event, body: transparent.data.url };
  }
);

export default serve({ client: inngest, functions: [makeImageTransparent] });
