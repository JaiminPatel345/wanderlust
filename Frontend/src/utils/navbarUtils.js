/**
 * Determines if the search bar should be shown based on the current path
 * @param {string} path - The current path from location.pathname
 * @param {string[]} showPaths - Array of paths where search bar should be shown
 * @param {string[]} hidePaths - Array of paths where search bar should be hidden
 * @returns {boolean} - Whether the search bar should be shown
 */
export const shouldShowSearchBar = (path, showPaths, hidePaths) => {
  // Check if path is in hidePaths (exact match or pattern match)
  for (const excludePath of hidePaths) {
    if (excludePath === path) return false;
    
    // Handle path parameters
    if (excludePath.includes(':id')) {
      const regex = new RegExp(
        '^' + excludePath.replace(':id', '[^/]+') + '$'
      );
      if (regex.test(path)) return false;
    }
  }
  
  // Check if path is in showPaths (exact match or pattern match)
  for (const includePath of showPaths) {
    if (includePath === path) return true;
    
    // Handle path parameters
    if (includePath.includes(':id')) {
      const regex = new RegExp(
        '^' + includePath.replace(':id', '[^/]+') + '$'
      );
      if (regex.test(path)) return true;
    }
  }
  
  return false;
}; 