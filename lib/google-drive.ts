import { google } from "googleapis";
import { Readable } from "stream";

/**
 * Uploads a base64 image to Google Drive and returns the file link.
 */
export async function uploadToDrive(base64Data: string, fileName: string) {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_DRIVE_FOLDER_ID) {
        console.warn("Skipping Google Drive upload: Credentials or Folder ID missing.");
        return null;
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        const drive = google.drive({ version: 'v3', auth });

        // Convert base64 to stream
        const buffer = Buffer.from(base64Data, "base64");
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        const response = await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
            },
            media: {
                mimeType: 'image/jpeg',
                body: stream,
            },
            fields: 'id, webViewLink, webContentLink',
        });

        // Set permission to public view if needed, or keep private
        /*
        await drive.permissions.create({
            fileId: response.data.id!,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });
        */

        return {
            id: response.data.id,
            link: response.data.webViewLink || response.data.webContentLink,
        };
    } catch (error) {
        console.error("Google Drive Upload Error:", error);
        return null;
    }
}
