export * from "./Transformer";

export const stringToNumber = (v: string): number => {
  const num = parseInt(v, 10);
  if (isNaN(num)) throw new Error(`cannot convert "${v}" to a number`);
  return num;
};
