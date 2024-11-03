import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import QueryProvider from "@/providers/QueryProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Video Annotation App",
  description: "A platform for annotating and managing videos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          poppins.variable,
          "min-h-screen font-poppins bg-background text-foreground"
        )}
      >
        <QueryProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64">
              <div className="container p-8">{children}</div>
            </main>
          </div>
          <Toaster
            toastOptions={{
              classNames: {
                success: "bg-green-600 text-white",
                error: "bg-red-600 text-white",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
