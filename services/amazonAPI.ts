// services/amazonAPI.ts
import Constants from 'expo-constants';

// Configuration - Replace these with your actual Amazon Associate credentials
const AMAZON_ASSOCIATE_TAG = Constants.expoConfig?.extra?.amazonAssociateTag;

export const searchAmazonProducts = async (query: string) => {
  // Return a manual entry option with direct Amazon search
  return [
    {
      id: 'manual-entry',
      asin: '',
      title: '🔍 Search Amazon for "' + query + '"',
      price: 'Click to browse',
      image: null,
      url: `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_ASSOCIATE_TAG}`,
      affiliateUrl: `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_ASSOCIATE_TAG}`,
    },
    {
      id: 'manual-entry-2',
      asin: '',
      title: '✍️ Manually add a wishlist item',
      price: 'Custom entry',
      image: null,
      url: '',
      affiliateUrl: '',
      isManual: true,
    }
  ];
};

const getMockProducts = (query: string) => {
  // Keep your existing mock products as fallback
  return [
    {
      id: `1-${Date.now()}`,
      asin: '',
      title: `${query} - Premium Quality`,
      price: '$29.99',
      image: null,
      url: `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_ASSOCIATE_TAG}`,
      affiliateUrl: `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AMAZON_ASSOCIATE_TAG}`,
    },
    // ... more mock products
  ];
};

export async function normalizeAmazonLink(url: string): Promise<string> {
  let finalUrl = url;

  // 1. Expand short links (a.co)
  if (url.includes("a.co/")) {
    try {
      const res = await fetch(url, { method: "GET", redirect: "follow" });
      finalUrl = res.url;
      console.log("Expanded:", finalUrl);
    } catch (e) {
      console.warn("Expand failed:", e);
    }
  }

  try {
    const parsed = new URL(finalUrl);

    // 2. Extract ASIN
    let asin = null;

    // Formats:
    // /dp/ASIN
    // /gp/product/ASIN
    const dpMatch = parsed.pathname.match(/\/dp\/([A-Z0-9]{8,12})/i);
    const gpMatch = parsed.pathname.match(/\/product\/([A-Z0-9]{8,12})/i);

    asin = dpMatch?.[1] || gpMatch?.[1];

    if (!asin) {
      console.warn("ASIN not found in URL, returning original");
      return finalUrl;
    }

    // 3. Build clean URL
    const cleanUrl = `https://${parsed.hostname}/dp/${asin}`;

    // 4. Add your affiliate tag
    console.log(`${cleanUrl}?tag=${AMAZON_ASSOCIATE_TAG}`)
    return `${cleanUrl}?tag=${AMAZON_ASSOCIATE_TAG}`;

  } catch (e) {
    console.error("Error normalizing URL:", e);
    return finalUrl;
  }
}
