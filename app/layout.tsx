import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import ReduxProvider from "@/redux/provider";
import QueryProvider from "@/providers/query-provider";
import AuthProvider from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Nabath",
  description:
    "Your personal financial operating system. Track income, expenses, accounts, and get AI-powered insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full antialiased", inter.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReduxProvider>
            <QueryProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </QueryProvider>
          </ReduxProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--card-foreground)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
