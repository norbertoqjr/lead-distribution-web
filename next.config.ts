import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // BACKEND_URL is read only in server components and route handlers. It is
  // deliberately absent from `env` here — exposing it would leak the private
  // API port into the client bundle.
};

export default nextConfig;
