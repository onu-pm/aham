import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aham",
    short_name: "Aham",
    description: "Gentle habit building and self-growth for neurodivergent minds.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9fc",
    theme_color: "#ece8fe",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
