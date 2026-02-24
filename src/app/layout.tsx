import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReCaptchaProvider } from "@/components/recaptcha-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Upromptly — AI Prompt Optimizer",
  description: "Transform your rough ideas into precision-engineered AI prompts. Upromptly compiles natural language into optimized, executable instruction sets.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
      >
        <ReCaptchaProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ReCaptchaProvider>
      </body>
    </html>
  );
}
