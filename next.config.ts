import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedEnv: true,
    useTypeScriptCli: false,
  },
};

export default nextConfig;
