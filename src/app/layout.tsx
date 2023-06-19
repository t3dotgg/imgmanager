// app/layout.tsx
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import TopNavLayout from "./_components/topnav";

export const metadata = {
  title: "ImgThing",
  description: "A Thing For Images",
};

export const runtime = "edge";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <TopNavLayout>{children}</TopNavLayout>
        </body>
      </html>
    </ClerkProvider>
  );
}
