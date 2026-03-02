import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "Marathi Bandhan — Find Your Life Partner",
  description:
    "A modern matrimony platform to help you find meaningful, lasting connections.",
};

// Inline script applied before first paint — prevents flash of wrong theme (FOUC)
const themeScript = `
(function () {
  try {
    var t = localStorage.getItem('bandhan-theme');
    if (t && ['light','dark','blush'].includes(t)) {
      document.documentElement.setAttribute('data-theme', t);
    }
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      {/* suppressHydrationWarning: data-theme is set by the inline script
          before React hydrates, causing a mismatch warning without this */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
