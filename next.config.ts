import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const parseOrigin = (value?: string) => {
  if (!value) {
    return undefined;
  }

  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
};

const getConnectSources = () => {
  const sources = new Set<string>(["'self'"]);

  const backendOrigin = parseOrigin(process.env.BACKEND_URL);
  const collabWsOrigin = parseOrigin(process.env.COLLAB_BACKEND_WS_URL);

  if (backendOrigin) {
    sources.add(backendOrigin);
  }

  if (collabWsOrigin) {
    sources.add(collabWsOrigin);
  }

  if (!isProduction) {
    sources.add("http://localhost:8080");
    sources.add("ws://localhost:8080");
  }

  return Array.from(sources).join(" ");
};

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://unpkg.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src ${getConnectSources()}`,
  "worker-src 'self' blob:",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), microphone=()",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
