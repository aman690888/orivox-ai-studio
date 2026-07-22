/**
 * ImageEngine — Smart image decision maker and prompt generator for Orivox V3.
 */

export interface ImageQuerySpec {
  query: string;
  style: "cinematic" | "minimal-tech" | "corporate-executive" | "creative-abstract" | "architectural";
  aspectRatio: "16:9" | "4:3" | "1:1";
  lighting: string;
  fallbackUrl: string;
}

export class ImageEngine {
  public static generateImageSpec(slideTitle: string, topic: string): ImageQuerySpec {
    const combined = `${slideTitle} ${topic}`.toLowerCase();

    let category = "technology";
    let fallbackId = "1518770660439-4636190af475"; // tech abstract

    if (combined.includes("nature") || combined.includes("environment") || combined.includes("sustain")) {
      category = "nature,sustainability";
      fallbackId = "1500382017468-9049fed747ef";
    } else if (combined.includes("people") || combined.includes("team") || combined.includes("collaboration") || combined.includes("culture")) {
      category = "office,people,meeting";
      fallbackId = "1522071820081-009f0129c71c";
    } else if (combined.includes("finance") || combined.includes("money") || combined.includes("growth") || combined.includes("business")) {
      category = "finance,skyscraper,architecture";
      fallbackId = "1486406146926-c627a92ad1ab";
    } else if (combined.includes("ai") || combined.includes("future") || combined.includes("robot") || combined.includes("code")) {
      category = "cyberpunk,future,technology";
      fallbackId = "1618005182384-a83a8bd57fbe";
    }

    const cleanTitle = slideTitle.replace(/[^\w\s]/gi, "").trim();

    return {
      query: `${cleanTitle} ${category} professional presentation photo`,
      style: "cinematic",
      aspectRatio: "16:9",
      lighting: "Soft ambient lighting with high contrast",
      fallbackUrl: `https://images.unsplash.com/photo-${fallbackId}?auto=format&fit=crop&w=1200&q=80`,
    };
  }
}
