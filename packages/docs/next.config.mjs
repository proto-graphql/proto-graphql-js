import nextra from "nextra";

const withNextra = nextra({
  contentDirBasePath: "/",
});

// biome-ignore lint/style/noDefaultExport: Next.js config file requires a default export.
export default withNextra({
  output: "export",
  images: {
    unoptimized: true,
  },
});
