const convertToKebabCase = (toReplace: string) =>
  toReplace
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();

export default convertToKebabCase;
