import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep pdfjs-dist unbundled on the server so the legacy Node.js build works
  serverExternalPackages: ['pdfjs-dist', 'pdf-parse'],
  images: { remotePatterns:
    [{
      protocol: 'https',
      hostname: 'covers.openlibrary.org',
    },
  {
    protocol: 'https',
      hostname: 'dmipwjqdutvlq1in.public.blob.vercel-storage.com',
  }]
  }
};

export default nextConfig;
