"use server";

import { verifyMedicine } from "@/lib/gemini";
import { logScanResult } from "@/lib/google-sheets";

export async function verifyMedicineAction(formData: FormData) {
    const oldStrip = formData.get("oldStrip") as string;
    const newStrip = formData.get("newStrip") as string;

    if (!oldStrip || !newStrip) {
        return { error: "Both images are required." };
    }

    // Verify with Gemini
    try {
        const result = await verifyMedicine(oldStrip, newStrip);

        // Log to Google Sheets (fire and forget)
        // logScanResult(result).catch(console.error);

        return { success: true, data: result };
    } catch (error) {
        console.error("Verification failed:", error);
        return { error: error instanceof Error ? error.message : "Failed to verify medicine." };
    }
}
