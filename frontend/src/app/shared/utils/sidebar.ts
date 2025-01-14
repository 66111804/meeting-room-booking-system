/**
 * Checks if a given pathname matches a menu link pattern
 * Handles both exact matches and parameterized routes
 */
export function isRouteMatching(pathname: string, menuLink: string): boolean {
  // Exact match
  if (pathname === menuLink) {
    return true;
  }

  // Check if the pathname is a child of the menu link
  // e.g., /booking-room/12/info should match with /booking-room
  if (pathname.startsWith(menuLink + '/')) {
    return true;
  }

  return false;
}

/**
 * Recursively finds a menu item based on the current pathname
 */
export function findActiveMenuItem(pathname: string, menuItems: any[]): any {
  for (const menuItem of menuItems) {
    if (menuItem.link && isRouteMatching(pathname, menuItem.link)) {
      return menuItem;
    }

    if (menuItem.subItems) {
      const foundItem = findActiveMenuItem(pathname, menuItem.subItems);
      if (foundItem) {
        return foundItem;
      }
    }
  }

  return null;
}
