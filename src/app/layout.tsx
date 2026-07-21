import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { publicEnvironment } from "@/lib/env/public";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: publicEnvironment.NEXT_PUBLIC_APP_NAME,
    template: `%s | ${publicEnvironment.NEXT_PUBLIC_APP_NAME}`,
  },
  description: publicEnvironment.NEXT_PUBLIC_APP_DESCRIPTION,
  applicationName: publicEnvironment.NEXT_PUBLIC_APP_NAME,
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#07111f",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
