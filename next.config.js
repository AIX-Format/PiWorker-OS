/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        tls: false,
        net: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        dns: false,
        child_process: false,
      };
    }
    return config;
  },
  serverExternalPackages: ['@grpc/grpc-js', '@grpc/proto-loader'],
};

export default nextConfig;
