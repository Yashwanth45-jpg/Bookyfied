import type { Metadata } from "next";
import { IBM_Plex_Serif, Mona_Sans} from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "sonner";

const ibmPlexSerif = IBM_Plex_Serif({
    variable: "--font-ibm-plex-serif",
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    display: 'swap'
});

const monaSans = Mona_Sans({
    variable: '--font-mona-sans',
    subsets: ['latin'],
    display: 'swap'
})

export const metadata: Metadata = {
  title: "Bookified",
  description: "Transform your books into interactive AI conversations. Upload PDFs, and chat with your books using voice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSerif.variable} ${monaSans.variable} relative font-sans antialiased`}
      >
        <ClerkProvider>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#f8f4e9',
                color: '#212a3b',
                border: '1px solid rgba(33,42,59,0.15)',
                borderRadius: '0.75rem',
                fontFamily: 'var(--font-mona-sans)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 16px 32px rgba(0,0,0,0.12)',
              },
              classNames: {
                error: 'toast-error',
                success: 'toast-success',
                info: 'toast-info',
              },
            }}
          />
        </ClerkProvider>
      </body>
    </html>
  );
}