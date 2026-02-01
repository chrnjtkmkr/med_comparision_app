const { GoogleGenerativeAI } = require("@google/generative-ai");

// Hardcoding key here for the script as loading from .env.local needs extra setup in plain node script
const apiKey = "AIzaSyDrZlGg-c70ZAYqPfBqxk4fCljAtLOlv2w";

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // dummy
        // Actually SDK doesn't have listModels on the instance directly usually, 
        // it's often on the class or manager. 
        // Wait, the SDK creates specific clients.
        // Let's use the fetch directly to be sure.

        // Using fetch to list models
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("No models found or error:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
