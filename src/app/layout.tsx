import type { Metadata } from "next";
import type { Viewport } from "next";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://ai-pocketstock.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "PocketStock - 종목분석",
  description: "PocketStock에서 실시간 주가 추이 분석과 포트폴리오 관리를 편리하게 시작해보세요.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "PocketStock",
    title: "PocketStock - 종목분석",
    description: "PocketStock에서 실시간 주가 추이 분석과 포트폴리오 관리를 편리하게 시작해보세요.",
    locale: "ko_KR",
    images: [
      {
        url: "/og/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PocketStock - 종목분석",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PocketStock - 종목분석",
    description: "PocketStock에서 실시간 주가 추이 분석과 포트폴리오 관리를 편리하게 시작해보세요.",
    images: ["/og/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
