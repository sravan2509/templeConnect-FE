export type NodeKind = "hub" | "detail" | "temple-search" | "birth-chart-form" | "birth-chart-result";

export interface DetailRow {
  icon?: string;
  label: string;
  value?: string;
  toggle?: boolean;
  defaultOn?: boolean;
}

export interface TreeNode {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  kind?: NodeKind;
  children?: TreeNode[];
  rows?: DetailRow[];
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
        {
          id: "personalized-greeting",
          title: "Personalized Greeting",
          icon: "👋",
          kind: "detail",
          subtitle: "Greeting banner based on time of day and user's spiritual profile",
        },
        {
          id: "quick-links",
          title: "Quick Links",
          icon: "⚡",
          kind: "hub",
          children: [
            { id: "book-priest-astrologer", title: "Book Priest or Astrologer", icon: "🧑‍🦱", kind: "detail" },
            { id: "todays-temple-timings", title: "Today's Temple Timings", icon: "🕒", kind: "detail" },
            { id: "suggested-temple-visits", title: "Suggested Temple Visits", icon: "✅", kind: "detail" },
            { id: "general-dos-donts", title: "General Dos and Donts", icon: "📋", kind: "detail" },
          ],
        },
        {
          id: "recommended-rituals-widget",
          title: "Recommended Rituals Widget",
          icon: "⭐",
          kind: "detail",
          subtitle: "Rituals suggested from the user's astrology profile",
        },
        {
          id: "proximity-alerts",
          title: "Proximity Alerts",
          icon: "📍",
          kind: "hub",
          children: [
            { id: "nearest-ongoing-puja-alert", title: "Nearest Ongoing Puja Alert", icon: "🔔", kind: "detail" },
            { id: "nearby-temple-event-calendar-snippet", title: "Nearby Temple Event Calendar Snippet", icon: "📅", kind: "detail" },
          ],
        },
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
        {
          id: "temple-search-filters",
          title: "Temple Search and Filters",
          icon: "🔍",
          kind: "temple-search",
          subtitle: "Filter by location, deity, speciality; sort by distance or rating",
        },
        {
          id: "temple-profile-page",
          title: "Temple Profile Page",
          icon: "🛕",
          kind: "hub",
          children: [
            { id: "location-directions", title: "Location and Directions", icon: "✅", kind: "detail" },
            { id: "parking-info", title: "Parking Info", icon: "🅿️", kind: "detail" },
            { id: "realtime-timings-sevas", title: "Real-time Timings and Daily Sevas", icon: "🕒", kind: "detail" },
            { id: "special-events-calendar", title: "Special Events Calendar", icon: "📅", kind: "detail" },
            { id: "set-reminder", title: "Set Reminder", icon: "⏰", kind: "detail" },
            { id: "temple-history-deity-details", title: "Temple History and Deity Details", icon: "📜", kind: "detail" },
            { id: "temple-speciality-highlight", title: "Temple Speciality Highlight", icon: "🌟", kind: "detail" },
          ],
        },
        {
          id: "map-view",
          title: "Map View",
          icon: "🗺️",
          kind: "detail",
          subtitle: "Map of nearby temples (pins for search results)",
        },
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
        {
          id: "astrology-profile-setup",
          title: "Astrology Profile Setup",
          icon: "🪐",
          kind: "hub",
          children: [
            { id: "input-edit-birth-data", title: "Input or Edit Birth Data", icon: "✏️", kind: "birth-chart-form" },
          ],
        },
        {
          id: "knowledge-base",
          title: "Knowledge Base",
          icon: "📚",
          kind: "hub",
          children: [
            { id: "search-knowledge-base", title: "Search Knowledge Base", icon: "🔍", kind: "detail" },
            { id: "cultural-content", title: "Cultural Content", icon: "🎭", kind: "detail" },
            { id: "kids-stories-micro-videos", title: "Kids Stories and Micro Videos", icon: "🧒", kind: "detail" },
            { id: "temple-etiquette-practices", title: "Temple Etiquette and Practices", icon: "🙏", kind: "detail" },
          ],
        },
        {
          id: "personalized-guidance",
          title: "Personalized Guidance",
          icon: "🧭",
          kind: "hub",
          children: [
            { id: "astrological-forecast", title: "Astrological Forecast", icon: "⭐", kind: "birth-chart-result" },
            { id: "detailed-ritual-recommendations", title: "Detailed Ritual Recommendations", icon: "📋", kind: "detail" },
          ],
        },
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
        {
          id: "my-bookings",
          title: "My Bookings",
          icon: "🗂️",
          kind: "hub",
          children: [
            {
              id: "upcoming-bookings",
              title: "Upcoming Bookings",
              icon: "📋",
              kind: "hub",
              children: [
                { id: "reschedule-cancel-booking", title: "Reschedule or Cancel Booking", icon: "🔁", kind: "detail" },
              ],
            },
            { id: "booking-history", title: "Booking History", icon: "🕒", kind: "detail" },
          ],
        },
        {
          id: "priest-astrologer-directory",
          title: "Priest and Astrologer Directory",
          icon: "🧑‍🦱",
          kind: "hub",
          children: [
            {
              id: "search-filters-directory",
              title: "Search and Filters Directory",
              icon: "🔍",
              kind: "hub",
              children: [
                { id: "filter-by-specialization", title: "Filter by Specialization", icon: "🏷️", kind: "detail" },
                { id: "filter-by-rating", title: "Filter by Rating", icon: "⭐", kind: "detail" },
                { id: "filter-by-language", title: "Filter by Language", icon: "🗣️", kind: "detail" },
                { id: "filter-by-availability", title: "Filter by Availability", icon: "📅", kind: "detail" },
              ],
            },
            {
              id: "verified-profile-page",
              title: "Verified Profile Page",
              icon: "✅",
              kind: "hub",
              children: [
                { id: "verification-status", title: "Verification Status", icon: "✅", kind: "detail" },
                { id: "qualifications-experience", title: "Qualifications and Experience", icon: "🎓", kind: "detail" },
                { id: "ratings-reviews", title: "Ratings and Reviews", icon: "⭐", kind: "detail" },
                { id: "service-menu-pricing", title: "Service Menu and Pricing", icon: "💲", kind: "detail" },
                {
                  id: "booking-flow",
                  title: "Booking Flow",
                  icon: "🗓️",
                  kind: "hub",
                  children: [
                    { id: "booking-step-1-select-service", title: "Booking Step 1: Select Service", icon: "1️⃣", kind: "detail" },
                    { id: "booking-step-2-select-professional-datetime", title: "Booking Step 2: Select Professional, Date & Time", icon: "2️⃣", kind: "detail" },
                    { id: "booking-step-3-payment", title: "Booking Step 3: Payment", icon: "3️⃣", kind: "detail" },
                    { id: "booking-confirmation-reminders", title: "Booking Confirmation and Reminders", icon: "🎉", kind: "detail" },
                  ],
                },
              ],
            },
          ],
        },
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
        {
          id: "help-center-contact-support",
          title: "Help Center and Contact Support",
          icon: "🆘",
          kind: "hub",
          children: [
            {
              id: "help-center",
              title: "Help Center",
              icon: "❓",
              kind: "detail",
              rows: [
                { icon: "📖", label: "Frequently Asked Questions" },
                { icon: "🧭", label: "App Guide" },
                { icon: "🚩", label: "Report an Issue" },
              ],
            },
            {
              id: "contact-support",
              title: "Contact Support",
              icon: "💬",
              kind: "detail",
              rows: [
                { icon: "✉️", label: "Email Support", value: "support@templeconnect.app" },
                { icon: "📞", label: "Call Us", value: "+91 90000 00000" },
                { icon: "💬", label: "Live Chat", value: "Available 9am–9pm" },
              ],
            },
          ],
        },
        { id: "my-spiritual-profile", title: "My Spiritual Profile", icon: "🕉️", kind: "birth-chart-result" },
        {
          id: "settings",
          title: "Settings",
          icon: "⚙️",
          kind: "hub",
          children: [
            {
              id: "notification-preferences",
              title: "Notification Preferences",
              icon: "🔔",
              kind: "detail",
              rows: [
                { icon: "🛕", label: "Puja Reminders", toggle: true, defaultOn: true },
                { icon: "📅", label: "Temple Event Alerts", toggle: true, defaultOn: true },
                { icon: "🗓️", label: "Booking Updates", toggle: true, defaultOn: true },
                { icon: "🏷️", label: "Promotional Offers", toggle: true, defaultOn: false },
              ],
            },
            {
              id: "account-security",
              title: "Account and Security",
              icon: "🔒",
              kind: "detail",
              rows: [
                { icon: "🔑", label: "Change Password" },
                { icon: "🛡️", label: "Two-Factor Authentication" },
                { icon: "📱", label: "Linked Devices" },
                { icon: "🗑️", label: "Delete Account" },
              ],
            },
          ],
        },
        {
          id: "premium-membership",
          title: "Premium Membership",
          icon: "💎",
          kind: "hub",
          children: [
            {
              id: "view-plan-details",
              title: "View Plan Details",
              icon: "📄",
              kind: "detail",
              rows: [
                { icon: "💎", label: "Current Plan", value: "Free" },
                { icon: "🛕", label: "Temple Bookmarks", value: "Up to 5" },
                { icon: "🧑‍🦱", label: "Priest Consultations", value: "Pay per session" },
              ],
            },
            {
              id: "upgrade-manage-subscription",
              title: "Upgrade or Manage Subscription",
              icon: "⬆️",
              kind: "detail",
              rows: [
                { icon: "⭐", label: "Premium — Monthly", value: "₹199/mo" },
                { icon: "🌟", label: "Premium — Yearly", value: "₹1,499/yr" },
                { icon: "💳", label: "Manage Payment Method" },
                { icon: "❌", label: "Cancel Subscription" },
              ],
            },
          ],
        },
        {
          id: "my-activity-history",
          title: "My Activity and History",
          icon: "📈",
          kind: "hub",
          children: [
            {
              id: "booking-history-profile",
              title: "Booking History",
              icon: "🕒",
              kind: "detail",
              rows: [
                { icon: "🧑‍🦱", label: "Pandit Sharma — Griha Pravesh", value: "Jul 2, 2026" },
                { icon: "🧑‍🦱", label: "Acharya Gupta — Satyanarayan Puja", value: "May 18, 2026" },
                { icon: "🧑‍🦱", label: "Pandit Rao — Astrology Consultation", value: "Mar 4, 2026" },
              ],
            },
            {
              id: "temple-checkins-visits",
              title: "Temple Check-ins and Visits",
              icon: "📍",
              kind: "detail",
              rows: [
                { icon: "🛕", label: "Hanuman Temple", value: "Jul 10, 2026" },
                { icon: "🛕", label: "Shiva Temple", value: "Jun 21, 2026" },
                { icon: "🛕", label: "Durga Temple", value: "Apr 9, 2026" },
              ],
            },
            {
              id: "donations",
              title: "Donations",
              icon: "💰",
              kind: "detail",
              rows: [
                { icon: "🛕", label: "Shiva Temple", value: "₹501" },
                { icon: "🛕", label: "Krishna Temple", value: "₹1,100" },
                { icon: "🛕", label: "Durga Temple", value: "₹251" },
              ],
            },
          ],
        },
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
