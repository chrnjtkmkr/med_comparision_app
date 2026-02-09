"use server";

import { analyzeSingleMedicine } from "@/lib/gemini";

export async function scanMedicineAction(formData: FormData) {
    const image = formData.get("image") as string;
    if (!image) return { error: "Image is required." };

    try {
        // Simple direct analysis without logging/uploading for speed and reliability
        const result = await analyzeSingleMedicine(image);
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Scan error details:", {
            message: error.message,
            status: error.status,
            statusText: error.statusText
        });

        if (error.status === 429) {
            return { error: "API limit reached. Please wait 1 minute and try again." };
        }
        if (error.status === 503) {
            return { error: "AI service is busy. Retrying in 5 seconds..." };
        }

        return { error: "Failed to identify medicine. Please ensure the image is clear and try again." };
    }
}
