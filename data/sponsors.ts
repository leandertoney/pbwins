const ctas = ["Learn more", "View app", "Check courts", "Visit site", "Explore"];

// 10 distinct dark/muted colors matching the sleek background palette
export const sponsorColors = [
  "#701a45", // Dark Pink/Rose
  "#7f1d1d", // Dark Red
  "#1e3a8a", // Dark Blue
  "#065f46", // Dark Green
  "#581c87", // Dark Purple
  "#713f12", // Dark Yellow/Amber
  "#374151", // Dark Gray
  "#7c2d12", // Dark Orange
  "#164e63", // Dark Cyan
  "#115e59", // Dark Teal
];

const baseSponsors = [
  {
    name: "Court Crowd",
    desc: "Know who's on the court—before you are. Real-time crowd data at nearby pickleball courts",
    href: "https://courtcrowd.com",
    logo: "https://courtcrowd.com/court_crowd_icon.png",
  },
  {
    name: "Court Crowd",
    desc: "Know who's on the court—before you are. Real-time crowd data at nearby pickleball courts",
    href: "https://courtcrowd.com",
    logo: "https://courtcrowd.com/court_crowd_icon.png",
  },
  {
    name: "PA MedSpas",
    desc: "Discover trusted medical spas, compare services, and explore pricing across Pennsylvania",
    href: "https://pamedspas.com",
    logo: "https://pamedspas.com/logo.svg",
  },
  {
    name: "PA MedSpas",
    desc: "Discover trusted medical spas, compare services, and explore pricing across Pennsylvania",
    href: "https://pamedspas.com",
    logo: "https://pamedspas.com/logo.svg",
  },
  {
    name: "Laani",
    desc: "Simplify your salon management with all-in-one software for salon suites and studios",
    href: "https://uselaani.com",
    logo: "https://uselaani.com/laani_logo_trans.png",
  },
  {
    name: "Laani",
    desc: "Simplify your salon management with all-in-one software for salon suites and studios",
    href: "https://uselaani.com",
    logo: "https://uselaani.com/laani_logo_trans.png",
  },
  {
    name: "Seasonal Activities Guide",
    desc: "Find amazing fall activities near you. Discover fun things to do and October events",
    href: "https://seasonalactivitiesguide.com",
  },
  {
    name: "Seasonal Activities Guide",
    desc: "Find amazing fall activities near you. Discover fun things to do and October events",
    href: "https://seasonalactivitiesguide.com",
  },
  {
    name: "Epic Drone Pilots",
    desc: "Professional, FAA-certified drone pilot services across all 50 states for cinematic aerials",
    href: "https://epicdronepilots.com",
    logo: "https://images.pexels.com/photos/7437593/pexels-photo-7437593.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    name: "Epic Drone Pilots",
    desc: "Professional, FAA-certified drone pilot services across all 50 states for cinematic aerials",
    href: "https://epicdronepilots.com",
    logo: "https://images.pexels.com/photos/7437593/pexels-photo-7437593.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    name: "Rebelgrowth",
    desc: "Grow traffic automatically • 3-day trial + $9 first month",
    href: "https://rebelgrowth.com",
  },
  {
    name: "Chargeback.io",
    desc: "Prevent chargebacks on autopilot",
    href: "https://chargebacks.com",
  },
  {
    name: "Mocku",
    desc: "AI design tools for logos, visuals, and video",
    href: "https://mocku.ai",
  },
  {
    name: "Whisper Memos",
    desc: "Record voice memos, receive emails via Apple Watch",
    href: "https://whisper.com",
  },
  {
    name: "HypeProxies",
    desc: "Proxy infrastructure that scales with your automation",
    href: "https://hypeproxies.com",
  },
  {
    name: "Ping Proxies",
    desc: "Ethical residential proxies for scraping & AI",
    href: "https://pingproxies.com",
  },
  {
    name: "Rewardful",
    desc: "Launch and scale your affiliate program",
    href: "https://rewardful.com",
  },
  {
    name: "Inbound AI",
    desc: "Send, receive, and reply to emails in a single inbox",
    href: "https://inbound.ai",
  },
  {
    name: "Okara",
    desc: "Chat privately with 30+ AI models",
    href: "https://okara.ai",
  },
  {
    name: "FoundersStack",
    desc: "Lifetime access to powerful growth tools",
    href: "https://foundersstack.com",
  },
];

export const allSponsors = baseSponsors.map((sponsor, index) => ({
  ...sponsor,
  cta: ctas[index % ctas.length],
}));
