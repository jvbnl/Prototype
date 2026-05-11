/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Support `import css from './foo.css?raw'` so prototypes can ship their
    // CSS as an inline string and inject it on mount for full isolation.
    config.module.rules.push({
      resourceQuery: /raw/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;
