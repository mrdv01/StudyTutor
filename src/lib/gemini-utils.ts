/**
 * Safely extracts text output from Gemini's API response.
 * Works across SDK versions (old and new).
 */
export function extractGeminiText(result: any): string {
  try {
    //  New SDK format (v0.8+)
    if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return result.candidates[0].content.parts[0].text.trim();
    }

    //  Older SDK format (v0.7 and below)
    if (result?.response?.text) {
      return result.response.text().trim();
    }

    //  Fallback: Try to stringify unknown structures
    if (typeof result === "string") return result.trim();
    if (result?.toString) return result.toString().trim();

    console.error("Unexpected Gemini API format:", result);
    return "";
  } catch (err) {
    console.error("Error extracting Gemini text:", err);
    return "";
  }
}

/**
 * Utility to clean markdown-style JSON formatting from Gemini responses.
 */
export function cleanJsonResponse(text: string): string {
  return text.replace(/```json|```/g, "").trim();
}
