import { google } from "googleapis";

// NOTE: This requires a service account JSON key or properly authorized OAuth client.
// For the purpose of this prototype, we'll assume the credentials are in env vars 
// or we might need to use a public Apps Script shim if the user doesn't have a Service Account.
// However, standard node.js googleapis usage is as follows:

export async function logScanResult(data: any) {
    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
            ],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        // Assuming Sheet1 has headers: Timestamp, MatchStatus, Reason, Uses
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Sheet1!A:E',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [
                    [
                        new Date().toISOString(),
                        data.match_status,
                        data.reason,
                        data.details?.uses || "",
                        // Add other fields as needed
                    ]
                ],
            },
        });

        return response.data;
    } catch (error) {
        console.error("Google Sheets Log Error:", error);
        // Returning null instead of throwing so we don't block the UI if logging fails
        return null;
    }
}
