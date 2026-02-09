"use server";

import { analyzeSingleMedicine } from "@/lib/gemini";
import { logScanResult } from "@/lib/google-sheets";
import { uploadToDrive } from "@/lib/google-drive";

export async function scanMedicineAction(formData: FormData) {
    const image = formData.get("image") as string;
    if (!image) return { error: "Image is required." };

    try {
        // 1. Optional: Upload to Drive for logs
        const upload = await uploadToDrive(image, `scan_${Date.now()}.jpg`).catch(() => null);

        // 2. Analyze with Gemini
        const result = await analyzeSingleMedicine(image);

        // 3. Optional: Log to Sheets
        if (result) {
            logScanResult("MedicineScan", result, upload ? [{ id: upload.id, link: upload.link }] : []).catch(console.error);
        }

        return { success: true, data: result };
    } catch (error) {
        console.error("Scan error:", error);
        return { error: "Failed to identify medicine. Please ensure the image is clear." };
    }
}
