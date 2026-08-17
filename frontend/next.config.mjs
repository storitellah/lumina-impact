/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || "",
    NEXT_PUBLIC_DISPATCH_EMAIL: process.env.NEXT_PUBLIC_DISPATCH_EMAIL || "hello@storitellah.com",
  },
};

export default nextConfig;
