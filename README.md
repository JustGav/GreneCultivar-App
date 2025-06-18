# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Firebase Setup

This application uses Firebase Firestore to store and manage cultivar data. To run the application with Firebase integration, you need to:

1.  **Create a Firebase Project:** If you haven't already, create a project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
2.  **Enable Firestore:** In your Firebase project, enable Firestore. Start in "test mode" for easy initial setup, but remember to configure proper security rules for production.
3.  **Get Firebase Configuration (for Client-Side):**
    *   Go to your Firebase project settings.
    *   Under "Your apps", click on the "Web" icon (`</>`) to add a web app (if you haven't already).
    *   Register your app and Firebase will provide you with a configuration object.
4.  **Set Client-Side Environment Variables:**
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
5.  **Get Firebase Service Account Key (for Seeding Script):**
    *   Go to your Firebase project settings > Service accounts.
    *   Click "Generate new private key" and download the JSON file.
    *   **Security Note:** This file contains sensitive credentials. Keep it secure and do not commit it to your repository.
    *   Place this JSON file somewhere accessible by the seed script (e.g., create a `config` folder in your project root, add `config/your-service-account-key.json` to `.gitignore`, and place the key file there).
    *   Update the `SERVICE_ACCOUNT_KEY_PATH` variable in `scripts/seed-firestore.ts` to point to this file.
    *   Also, ensure the `FIREBASE_PROJECT_ID` in `scripts/seed-firestore.ts` matches your project ID, or set `NEXT_PUBLIC_FIREBASE_PROJECT_ID` in your `.env.local` file.

6.  **Install Firebase Admin SDK (for Seeding Script):**
    Run the following command in your project root:
    ```bash
    npm install --save-dev firebase-admin
    # or
    yarn add --dev firebase-admin
    ```

7.  **Seed Initial Data (Using Script):**
    *   Once your environment variables are set and your service account key is configured in `scripts/seed-firestore.ts`, you can run the seed script:
        ```bash
        npm run seed:firestore
        # or
        yarn seed:firestore
        ```
    *   This will populate your `cultivars` collection in Firestore with sample data. You can customize the data in `scripts/seed-firestore.ts` before running.
    *   **Note:** The script currently adds new data. If you want to clear existing data before seeding, uncomment the relevant lines in the `seedDatabase` function within the script.

Once these steps are completed, the application should be able to connect to your Firebase project and manage cultivar data in Firestore.
