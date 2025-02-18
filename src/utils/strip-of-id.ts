export const stripOfId = (val:string) => {
  if (val.length > 3 && val.toLowerCase().endsWith('_id')) return val.slice(0,-3);
  if (val.length > 2 && val.toLowerCase().endsWith('id')) return val.slice(0,-2);
  return val;
}
