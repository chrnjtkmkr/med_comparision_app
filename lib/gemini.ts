import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);


function extractJson(text: string) {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) return jsonMatch[1].trim();
    const startIndex = text.indexOf("{");
    const endIndex = text.lastIndexOf("}");
    if (startIndex !== -1 && endIndex !== -1) return text.substring(startIndex, endIndex + 1);
    return text.trim();
  } catch (e) {
    console.error("JSON Extraction Error:", e);
    return text;
  }
}

function prepareImagePart(base64Data: string) {
  // Strip prefix if exists (e.g., data:image/jpeg;base64,)
  const base64Content = base64Data.includes(";base64,")
    ? base64Data.split(";base64,")[1]
    : base64Data;

  // Try to detect mime type from prefix
  let mimeType = "image/jpeg";
  if (base64Data.startsWith("data:image/png")) mimeType = "image/png";
  if (base64Data.startsWith("data:image/webp")) mimeType = "image/webp";

  return { inlineData: { data: base64Content, mimeType } };
}

export async function verifyMedicine(oldStripBase64: string, newStripBase64: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      You are an expert Pharmacy Auditor. Compare these two medicine strips for composition matching and safety.
      Image 1: Old Strip (Prescribed/Previous). Image 2: New Strip (Current/Dispensed).
      
      Required Output Format (Strict JSON):
      {
        "match_percentage": number,
        "verdict": "SAFE" | "ASK DOCTOR" | "NOT RECOMMENDED",
        "match_status": "SAFE MATCH" | "MISMATCH DETECTED" | "CRITICAL ALERT",
        "reason": "Clear explanation of why this verdict was given.",
        "warnings": ["Warning 1", "Warning 2"],
        "generic_suggestion": { "name": "Generic Name", "benefit": "Save % info" },
        "comparison_table": [
          { "feature": "Salt 1", "old": "Old Strength", "new": "New Strength" }
        ],
        "old_medicine": { "name": "Name", "details": { "uses": "", "pros": "", "cons": "", "precautions": "" } },
        "new_medicine": { "name": "Name", "details": { "uses": "", "pros": "", "cons": "", "precautions": "" } }
      }
      Respond ONLY with the JSON object.
    `;
    const imageParts = [
      { inlineData: { data: oldStripBase64, mimeType: "image/jpeg" } },
      { inlineData: { data: newStripBase64, mimeType: "image/jpeg" } },
    ];
    const result = await model.generateContent([prompt, ...imageParts]);
    return JSON.parse(extractJson(result.response.text()));
  } catch (error) {
    console.error("Gemini Scan Error:", error);
    throw new Error(`Gemini Scan Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function analyzePrescription(imageBase64: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      Analyze this prescription image. 
      1. Extract all medicines (Name, Dosage, Timing, Duration, Why prescribed).
      2. Provide a strict medical disclaimer.
      Output in JSON: { "medicines": [{ "name", "dosage", "timing", "duration", "explanation" }], "disclaimer" }
    `;
    const imagePart = { inlineData: { data: imageBase64, mimeType: "image/jpeg" } };
    const result = await model.generateContent([prompt, imagePart]);
    return JSON.parse(extractJson(result.response.text()));
  } catch (error) {
    throw new Error("Prescription Analysis failed");
  }
}

export async function findGenerics(medicineName: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      Find generic alternatives for the medicine: ${medicineName}.
      Ensure identical salt composition and strength.
      
      Required Output Format (Strict JSON):
      {
        "original": { "name": "Brand Name", "salt": "Chemical Composition" },
        "generics": [
          { "name": "Generic Brand", "salt": "Identical Salt", "price_range": "Range in ₹", "benefit": "Briefly why this is a good choice" }
        ]
      }
      Respond ONLY with the JSON object.
    `;
    const result = await model.generateContent(prompt);
    return JSON.parse(extractJson(result.response.text()));
  } catch (error) {
    throw new Error("Generic search failed");
  }
}

export async function analyzeSingleMedicine(imageBase64: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      As an expert Medical Auditor, analyze this medicine image and provide structured, reliable medical information.
      
      Identify the medicine name, brand, salts, strength, dosage form, and treated conditions.
      
      Required Output Format (Strict JSON):
      {
        "medicine_name": "Full brand name and generic name",
        "short_description": "A precise 1-sentence summary of what this medicine is and its type.",
        "main_uses": ["Primary indication 1", "Primary indication 2"],
        "salts": ["Salt 1 + Strength (e.g. Paracetamol 500mg)", "Salt 2..."],
        "strength": "Overall strength/concentration",
        "form": "Dosage form (e.g., Tablet, Capsule, Syrup, Gel)",
        "how_to_take": "Clear instructions on how to consume/apply this medicine.",
        "pros": ["Key benefit/efficacy 1", "Benefit 2"],
        "cons": ["Potential side effect or drawback 1", "Drawback 2"],
        "warnings": ["Critical safety warning 1", "Interaction warning"],
        "who_should_avoid": ["Groups or conditions that should avoid this medicine"]
      }
      
      Ensure absolute accuracy in salt composition and strength detection. 
      Respond ONLY with the JSON object.
    `;
    const imagePart = prepareImagePart(imageBase64);
    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text();
    console.log("Gemini Raw Response:", responseText);
    return JSON.parse(extractJson(responseText));
  } catch (error) {
    console.error("Medicine analysis error:", error);
    throw error;
  }
}

