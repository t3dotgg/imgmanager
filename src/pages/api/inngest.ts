import { uploadTransparent } from "@/app/api/uploadthing/make-transparent-file";
import { db } from "@/db";
import { uploadedImage } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Inngest, NonRetriableError, slugify, RetryAfterError } from "inngest";
import { serve } from "inngest/next";

// Create a client to send and receive events
export const inngest = new Inngest({ id: slugify("Img Manager") });

const makeImageTransparent = inngest.createFunction(
  {
    id: "gen/transparent",

    // Sadly, inngest's understanding of "ratelimit" varies greatly from
    // the industry standard, so I can't use this :(
    // rateLimit: {
    //   period: "60s",
    //   limit: 50,
    // },

    // I don't want concurrency instead but if I don't do this we get fucked
    concurrency: 3,

    onFailure: (e) => {
      console.log("gen/transparent failed", e.error);
    },
  },
  { event: "gen/transparent" },
  async ({ event, step }) => {
    console.log("image?", event.data.imageUrl, event.data.fileKey);

    if (!event.data.imageUrl || typeof event.data.imageUrl !== "string")
      throw new NonRetriableError("No image url");

    const transparent = await uploadTransparent(event.data.imageUrl);
    console.log("transparent response generated and uploaded", transparent);

    if (transparent.error !== null) {
      console.error("UNABLE TO UPLOAD TRANSPARENT IMAGE FILE", event);
      throw new RetryAfterError(
        "Unable to process and upload transparent image, retrying",
        60 * 1000
      );
    }

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
