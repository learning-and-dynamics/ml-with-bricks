export const getRandomString = (length: number): string => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  let result = "";
  for (const byte of arr) {
    result += chars[byte % chars.length];
  }
  return result;
};
