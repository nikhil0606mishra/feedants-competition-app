/** "multi-win" -> "Multi-Win" */
export const titleCase = (s: string) =>
  s.replace(/(^|[\s-])(\w)/g, (_m, sep: string, ch: string) => sep + ch.toUpperCase());
