export * from "./Transformer";
export * from "./extensions";

export const stringToNumber = (v: string): number => {
  const num = Number.parseInt(v, 10);
  if (Number.isNaN(num)) throw new Error(`cannot convert "${v}" to a number`);
  return num;
};
