export type NodeKind = "hub" | "detail" | "temple-search" | "birth-chart-form" | "birth-chart-result" | "map-view" | "book-puja";

export interface TreeNode {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  kind?: NodeKind;
  children?: TreeNode[];
}

export interface TabTree {
  tabId: string;
  tabTitle: string;
  root: TreeNode;
}

export const tabs: TabTree[] = [
  {
    tabId: "home",
    tabTitle: "Home",
    root: {
      id: "home-root",
      title: "Home",
      kind: "hub",
      children: [
        { id: "birth-details", title: "Enter Birth Details", icon: "🪐", kind: "birth-chart-form", subtitle: "Calculate your Rashi, Nakshatra, and deity recommendation" },
        { id: "spiritual-profile", title: "My Spiritual Profile", icon: "🕉️", kind: "birth-chart-result", subtitle: "View your Rashi, Nakshatra, deity, and suggestions" },
        { id: "notifications", title: "Notifications", icon: "🔔", kind: "detail", subtitle: "Your booking updates and suggestions" },
      ],
    },
  },
  {
    tabId: "temples",
    tabTitle: "Temples",
    root: {
      id: "temples-root",
      title: "Temples",
      kind: "hub",
      children: [
        { id: "temple-search-filters", title: "Search Temples", icon: "🔍", kind: "temple-search", subtitle: "Search by name, deity, city or state" },
        { id: "temple-map", title: "Temple Map", icon: "🗺️", kind: "map-view", subtitle: "Explore temples on the map" },
        { id: "saved-temples", title: "Saved Temples", icon: "⭐", kind: "detail", subtitle: "Temples you have bookmarked" },
        { id: "temple-guidelines", title: "Temple Guidelines", icon: "📋", kind: "detail", subtitle: "Do's and don'ts when visiting a temple" },
      ],
    },
  },
  {
    tabId: "rituals",
    tabTitle: "Rituals",
    root: {
      id: "rituals-root",
      title: "Rituals",
      kind: "hub",
      children: [
        { id: "astrology-profile-setup", title: "Astrology Profile", icon: "🪐", kind: "hub", children: [
          { id: "input-edit-birth-data", title: "Input or Edit Birth Data", icon: "✏️", kind: "birth-chart-form" },
          { id: "view-astro-profile", title: "View My Profile", icon: "🕉️", kind: "birth-chart-result" },
        ]},
        { id: "knowledge-base", title: "Knowledge Base", icon: "📚", kind: "hub", children: [
          { id: "cultural-content", title: "Cultural Content", icon: "🎭", kind: "detail" },
          { id: "kids-stories-micro-videos", title: "Kids Stories", icon: "🧒", kind: "detail" },
          { id: "temple-etiquette-practices", title: "Temple Etiquette", icon: "🙏", kind: "detail" },
        ]},
      ],
    },
  },
  {
    tabId: "connect",
    tabTitle: "Connect",
    root: {
      id: "connect-root",
      title: "Connect",
      kind: "hub",
      children: [
        { id: "book-puja-flow", title: "Book a Puja", icon: "🛕", kind: "book-puja", subtitle: "Browse pujas, select a priest, and book" },
        { id: "my-bookings", title: "My Bookings", icon: "📋", kind: "hub", children: [
          { id: "upcoming-bookings", title: "Upcoming Bookings", icon: "⏳", kind: "detail" },
          { id: "booking-history", title: "Booking History", icon: "✅", kind: "detail" },
        ]},
      ],
    },
  },
  {
    tabId: "profile",
    tabTitle: "Profile",
    root: {
      id: "profile-root",
      title: "Profile",
      kind: "hub",
      children: [
        { id: "my-spiritual-profile", title: "My Spiritual Profile", icon: "🕉️", kind: "birth-chart-result" },
        { id: "account", title: "Account", icon: "👤", kind: "detail", subtitle: "Edit your name or delete your account" },
        { id: "saved-temples", title: "Saved Temples", icon: "⭐", kind: "detail", subtitle: "Temples you have bookmarked" },
        { id: "visit-history", title: "Visit History", icon: "📍", kind: "detail", subtitle: "Temples you have checked in to" },
        { id: "notification-preferences", title: "Notification Settings", icon: "🔔", kind: "detail" },
        { id: "help-center", title: "Help & Support", icon: "❓", kind: "detail", subtitle: "FAQs and contact support" },
      ],
    },
  },
];

export function findNode(tabId: string, nodeId: string): TreeNode | undefined {
  const tab = tabs.find((t) => t.tabId === tabId);
  if (!tab) return undefined;
  function walk(node: TreeNode): TreeNode | undefined {
    if (node.id === nodeId) return node;
    for (const child of node.children ?? []) {
      const found = walk(child);
      if (found) return found;
    }
    return undefined;
  }
  return walk(tab.root);
}
