import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function verifyMedicine(oldStripBase64: string, newStripBase64: string) {
  try {
    // defaults to gemini-1.5-flash if gemini-2.0 is not yet available in the public SDK/region
    // But user asked for Gemini 3 (assuming they meant latest). 
    // We will use a model that supports vision.
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `
      You are an expert Pharmacy Auditor. 
      Compare these two medicine strips. 
      Image 1: Old Strip (Prescribed/Previous).
      Image 2: New Strip (Current/Dispensed).

      Analyze the Salt Composition visible in both.
      1. Are they a SAFE MATCH? (Identical salts or generic equivalent).
      2. If not, explain the MISMATCH.
      3. Identify both medicines.
      4. Provide Uses, Pros, Cons, and Precautions for BOTH medicines.
      5. Suggest a Generic Alternative for the basic treatment if applicable.
      6. Provide a Comparison Table comparing Salt, Strength, and Type.
      7. Include a strict disclaimer/warning.
      8. Output the response in JSON format with these exact keys: 
         {
           "match_status": "SAFE MATCH" | "MISMATCH",
           "reason": "String explanation...",
           "warnings": ["Warning 1", "Warning 2"],
           "generic_suggestion": {
             "name": "Generic Name",
             "benefit": "Why this is suggested (e.g. Cost)"
           },
           "comparison_table": [
             { "feature": "Salt Composition", "old": "Value", "new": "Value" },
             { "feature": "Strength/Dosage", "old": "Value", "new": "Value" },
             { "feature": "Manufacturer Type", "old": "Value", "new": "Value" }
           ],
           "old_medicine": {
             "name": "Identified Name",
             "details": {
               "uses": "String (In English)",
               "pros": "String (In English)",
               "cons": "String (In English)",
               "precautions": "String (In English)"
             }
           },
           "new_medicine": {
             "name": "Identified Name",
             "details": {
               "uses": "String (In English)",
               "pros": "String (In English)",
               "cons": "String (In English)",
               "precautions": "String (In English)"
             }
           }
         }
    `;

    const imageParts = [
      { inlineData: { data: oldStripBase64, mimeType: "image/jpeg" } },
      { inlineData: { data: newStripBase64, mimeType: "image/jpeg" } },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    // Clean up markdown code blocks if present
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Scan Error:", error);
    throw new Error(`Gemini Scan Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}
