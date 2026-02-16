// biome-ignore lint/style/noDefaultExport: Nextra requires `_meta.js` to export a default object.
export default {
  index: {
    title: "Home",
    theme: {
      layout: "full",
    },
  },
  "-- Type System": {
    type: "separator",
    title: "Type System",
  },
  "type-mapping": "Type Mapping",
  "proto-annotations": "Proto Annotations",
  "-- Code Generators": {
    type: "separator",
    title: "Code Generators",
  },
  "protoc-gen-pothos": "protoc-gen-pothos",
  development: {
    display: "hidden",
  },
};
