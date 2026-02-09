import { google } from "googleapis";

function getAuth() {
    return new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
}

const spreadsheetId = process.env.GOOGLE_SHEET_ID;

export async function logScanResult(type: string, data: any, driveLinks?: { id: string | null | undefined, link: string | null | undefined }[]) {
    if (!spreadsheetId) return null;
    try {
        await initializeSheetStructure();
        const auth = getAuth();
        const sheets = google.sheets({ version: 'v4', auth });

        const row = [
            new Date().toISOString(),
            type,
            data.medicine_name || data.name || data.match_status || "Query: " + data.query || "Unknown",
            data.verdict || data.reason || data.short_description || "Processed",
            JSON.stringify(data).substring(0, 5000), // Larger limit for full data
            driveLinks ? driveLinks.map(l => l.link).join(", ") : ""
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'History!A:F',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [row] },
        });
    } catch (error) {
        console.error("Sheets Log Error:", error);
    }
}

export async function saveUserProfile(profile: any) {
    if (!spreadsheetId) return null;
    try {
        const auth = getAuth();
        const sheets = google.sheets({ version: 'v4', auth });

        // Simple approach: Overwrite first row of 'Profile' sheet or append and we fetch latest
        const row = [
            new Date().toISOString(),
            profile.name,
            profile.age,
            profile.bloodGroup,
            JSON.stringify(profile.allergies),
            JSON.stringify(profile.conditions),
            profile.emergencyContact
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Profile!A2:G2',
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [row] },
        });
        return true;
    } catch (error) {
        console.error("Save Profile Error:", error);
        return false;
    }
}

export async function getUserProfile() {
    if (!spreadsheetId) return null;
    try {
        const auth = getAuth();
        const sheets = google.sheets({ version: 'v4', auth });
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Profile!A2:G2',
        });
        const rows = response.data.values;
        if (!rows || rows.length === 0) return null;
        const r = rows[0];
        return {
            name: r[1],
            age: r[2],
            bloodGroup: r[3],
            allergies: JSON.parse(r[4] || "[]"),
            conditions: JSON.parse(r[5] || "[]"),
            emergencyContact: r[6]
        };
    } catch (error) {
        console.error("Get Profile Error:", error);
        return null;
    }
}

export async function getHistoryFromSheets() {
    if (!spreadsheetId) return [];
    try {
        const auth = getAuth();
        const sheets = google.sheets({ version: 'v4', auth });
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'History!A:F',
        });
        const rows = response.data.values;
        if (!rows || rows.length <= 1) return []; // Skip header if exists

        return rows.slice(1).reverse().map((r, i) => ({
            id: `sheet-${i}`,
            date: r[0],
            type: r[1],
            title: r[2],
            status: r[3],
            data: JSON.parse(r[4] || "{}"),
            imageLink: r[5]
        }));
    } catch (error) {
        console.error("Get History Error:", error);
        return [];
    }
}

// Helper to initialize sheets if they don't exist
export async function initializeSheetStructure() {
    if (!spreadsheetId) return;
    try {
        const auth = getAuth();
        const sheets = google.sheets({ version: 'v4', auth });

        // Add sheets if missing (simplified version - might error if already exists, so we catch)
        try {
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId,
                requestBody: {
                    requests: [
                        { addSheet: { properties: { title: 'History' } } },
                        { addSheet: { properties: { title: 'Profile' } } }
                    ]
                }
            });

            // Set headers
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: 'History!A1:F1',
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [['Timestamp', 'Type', 'Title', 'Status', 'FullData', 'ImageLinks']] }
            });
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: 'Profile!A1:G1',
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: [['LastUpdated', 'Name', 'Age', 'BloodGroup', 'Allergies', 'Conditions', 'EmergencyContact']] }
            });
        } catch (e) {
            // Probably already exists
        }
    } catch (error) {
        console.error("Init Sheet Error:", error);
    }
}
