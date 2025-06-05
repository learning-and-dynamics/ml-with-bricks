export const getLocalStorageValue = <T>(key: string, defaultValue: T) => {
  if (typeof window === "undefined") {
    // If we are on the server, just return the default.
    return defaultValue;
  }
  try {
    const storedValue = window.localStorage.getItem(key);
    if (storedValue === null) {
      return defaultValue;
    }
    const parsedValue = JSON.parse(storedValue);
    
    // Convert "__undefined__" placeholders back to undefined
    if (Array.isArray(parsedValue)) {
      return parsedValue.map(row => 
        Array.isArray(row) ? row.map(cell => (cell === "__undefined__" ? undefined : cell)) : row
      );
    }
    return parsedValue === "__undefined__" ? undefined : parsedValue;
  } catch (error) {
    console.warn("Error reading localStorage key “" + key + "”: ", error);
    return defaultValue;
  }
};