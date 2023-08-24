import { Inngest } from "inngest";
import { serve } from "inngest/next";

// Create a client to send and receive events
export const inngest = new Inngest({ name: "Img Manager" });

const helloWorld = inngest.createFunction(
  { name: "Hello World" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    console.log("image?", event.data.imageUrl);
    await step.sleep("1s");
    return { event, body: "Hello, World!" };
  }
);

export default serve(inngest, [helloWorld]);
