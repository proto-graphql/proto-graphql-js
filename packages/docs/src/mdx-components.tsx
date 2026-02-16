import { useMDXComponents as getDocsMDXComponents } from "nextra-theme-docs";

const docsComponents = getDocsMDXComponents();

export function useMDXComponents(components?: Record<string, unknown>) {
  return {
    ...docsComponents,
    ...components,
  };
}
