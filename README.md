
# Firebase Studio: Grene.Life Seedbank

This is a NextJS starter for Grene.Life Seedbank in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Firebase Setup

This application uses Firebase Firestore to store and manage cultivar data, and Firebase Storage for image/document uploads. To run the application with Firebase integration, you need to:

1.  **Create a Firebase Project:** If you haven't already, create a project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
2.  **Enable Firestore:** In your Firebase project, enable Firestore.
    *   **Firestore Rules:** For robust security and data validation, it's recommended to use specific rules. The `firestore.rules` file in the project root provides a good starting point tailored to this application's data structure.
        *   **To Apply:** Go to Firestore Database > Rules tab in the Firebase console and paste the content of `firestore.rules`.
        *   **Development (Permissive - Use with caution):** For initial, unrestricted development, you could use:
            ```
            rules_version = '2';
            service cloud.firestore {
              match /databases/{database}/documents {
                match /{document=**} {
                  allow read, write: if true;
                }
              }
            }
            ```
        *   **Important:** The provided `firestore.rules` file includes placeholders like `// TODO: request.auth != null`. You **MUST** implement user authentication in your app and update these rules to enforce authenticated access for write operations before deploying to production.
3.  **Enable Firebase Storage:** In your Firebase project, navigate to Storage and click "Get started". Follow the prompts to enable it.
    *   **Storage Rules:** Similar to Firestore, specific rules are better for security. The `storage.rules` file in the project root provides a starting point.
        *   **To Apply:** Go to Storage > Rules tab in the Firebase console and paste the content of `storage.rules`.
        *   **Development (Permissive - Use with caution):** For initial, unrestricted development:
            ```
            rules_version = '2';
            service firebase.storage {
              match /b/{bucket}/o {
                match /{allPaths=**} {
                  allow read, write: if true;
                }
              }
            }
            ```
        *   **Important:** The provided `storage.rules` also includes placeholders like `// TODO: request.auth != null`. Implement authentication and update these rules for production.
4.  **Get Firebase Configuration (for Client-Side):**
    *   Go to your Firebase project settings.
    *   Under "Your apps", click on the "Web" icon (`</>`) to add a web app (if you haven't already).
    *   Register your app and Firebase will provide you with a configuration object.
5.  **Set Client-Side Environment Variables:**
    *   Create a `.env.local` file in the root of your project (if it doesn't exist).
    *   Copy the Firebase configuration values into this file, matching the keys provided in the `.env` file:
        ```
        NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
        NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
        NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id (optional)
        ```
6.  **Get Firebase Service Account Key (for Seeding Script):**
    *   Go to your Firebase project settings > Service accounts.
    *   Click "Generate new private key" and download the JSON file.
    *   **Security Note:** This file contains sensitive credentials. Keep it secure and do not commit it to your repository.
    *   Place this JSON file in the `scripts` folder and name it `serviceAccountKey.json`. Ensure `scripts/serviceAccountKey.json` is added to `.gitignore`.
    *   The `scripts/seed-firestore.ts` script is configured to look for `./serviceAccountKey.json` relative to its location.
    *   Also, ensure the `FIREBASE_PROJECT_ID` in `scripts/seed-firestore.ts` matches your project ID, or set `NEXT_PUBLIC_FIREBASE_PROJECT_ID` in your `.env.local` file.

7.  **Install Firebase Admin SDK (for Seeding Script):**
    Run the following command in your project root:
    ```bash
    npm install --save-dev firebase-admin
    # or
    yarn add --dev firebase-admin
    ```

8.  **Seed Initial Data (Using Script):**
    *   Once your environment variables are set and your service account key is configured, you can run the seed script:
        ```bash
        npm run seed:firestore
        # or
        yarn seed:firestore
        ```
    *   This will populate your `cultivars` collection in Firestore with sample data.

9.  **Client-Side Timestamp Handling (Important for Rules):**
    *   The provided Firestore rules (in `firestore.rules`) expect that `createdAt` and `updatedAt` fields on the main cultivar document are set by the server (`request.time`).
    *   To comply with this, your client-side Firebase service calls (in `src/services/firebase.ts`) for adding or updating cultivars **should be modified** to use `serverTimestamp()` from the Firebase SDK for these fields. For example:
        ```typescript
        // In src/services/firebase.ts
        import { serverTimestamp } from 'firebase/firestore';

        // When adding a document:
        // { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }

        // When updating a document:
        // { ...data, updatedAt: serverTimestamp() }
        ```
    *   Timestamps within arrays (like `review.createdAt` or `history.timestamp`) that are added via `arrayUnion` are currently set as client-generated ISO strings. The rules validate these as `is timestamp` (after Firestore's conversion). If stricter server-side timestamping is needed for these as well, the client logic would need to be adjusted, potentially by fetching the document, adding the new array item with a server timestamp, and then setting the whole array.

Once these steps are completed, your application should function with a more robust set of security rules. Remember to continually review and refine your rules as your application evolves.
