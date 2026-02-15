import nextra from "nextra";

const withNextra = nextra({
  contentDirBasePath: "/",
});

export default withNextra({
  output: "export",
  images: {
    unoptimized: true,
  },
});
