/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Prototypes ship their CSS as a string (`import css from './styles.css?raw'`)
    // and inject it on mount, so each prototype's styles are scoped to when it is
    // mounted. For that to actually isolate, the `?raw` file must NOT also be
    // picked up by Next's global CSS pipeline — otherwise every prototype's CSS
    // (e.g. billing's `body { min-width: 1280px }`) loads on every route.
    //
    // Next matches CSS by file extension and ignores the query string, so we
    // must explicitly exclude `?raw` from its built-in CSS/SCSS rules, then
    // handle `?raw` ourselves as a raw source string.
    for (const rule of config.module.rules) {
      if (!Array.isArray(rule.oneOf)) continue;
      for (const one of rule.oneOf) {
        if (one.resourceQuery || !one.test) continue;
        if (one.test.toString().includes("css")) {
          one.resourceQuery = { not: [/raw/] };
        }
      }
    }
    config.module.rules.push({
      resourceQuery: /raw/,
      type: "asset/source",
    });
    return config;
  },
};

export default nextConfig;
