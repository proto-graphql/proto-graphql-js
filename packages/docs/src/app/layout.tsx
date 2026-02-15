import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Layout, Navbar } from "nextra-theme-docs";
import "nextra-theme-docs/style.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

const siteUrl = "https://js.proto-graphql.dev";
const description =
  "Generate GraphQL schema definitions from Protocol Buffer definitions.";

export const metadata: Metadata = {
  title: {
    default: "proto-graphql-js",
    template: "%s | proto-graphql-js",
  },
  description,
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "proto-graphql-js",
    description,
    url: siteUrl,
    siteName: "proto-graphql-js",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "proto-graphql-js",
    description,
  },
};

const navbar = (
  <Navbar
    logo={<b>proto-graphql-js</b>}
    projectLink="https://github.com/proto-graphql/proto-graphql-js"
  />
);

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/proto-graphql/proto-graphql-js/tree/main/docs"
          editLink="Edit this page on GitHub"
          sidebar={{ autoCollapse: false, defaultMenuCollapseLevel: 1 }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
