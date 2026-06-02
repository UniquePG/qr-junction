# Firebase Authentication Setup Guide

This guide details how to set up Firebase Authentication for **Google Social Sign-In** and **Email/Password Authentication** to work with QR Junction.

---

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Enter your project name (e.g., `qr-junction`).
4. (Optional) Choose whether to enable Google Analytics for this project, then click **Continue**.
5. Click **Create project** and wait for it to initialize.

---

## Step 2: Enable Authentication Providers

1. In the left-hand sidebar, click on **Build** -> **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, enable the following providers:
   
   ### A. Email/Password
   - Click **Email/Password**.
   - Toggle **Enable** (leave "Email link (passwordless sign-in)" disabled).
   - Click **Save**.

   ### B. Google Social Login
   - Click **Add new provider** and select **Google**.
   - Toggle **Enable**.
   - Enter your **Project public-facing name** (e.g., `QR Junction`).
   - Select a **Project support email** from the dropdown.
   - Click **Save**.
   - *(Note: Firebase automatically configures the web client ID and client secret for Google OAuth internally).*

---

## Step 3: Register Your Web App & Get Config Keys

1. Click on the **Project Overview** (gear icon) in the left sidebar and select **Project settings**.
2. Under the **General** tab, scroll down to the **Your apps** section.
3. Click the **Web** icon (`</>`) to register a new web application.
4. Enter an App nickname (e.g., `QR Junction Web App`).
5. (Optional) Do **NOT** check "Also set up Firebase Hosting for this app".
6. Click **Register app**.
7. Firebase will display your `firebaseConfig` object containing credentials. You will need these keys for your `.env` file:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

---

## Step 4: Configure Local Environment Variables

Add the client credentials and Firebase admin credentials (for backend validation) to your `.env` file:

```env
# Firebase Client SDK Credentials
NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_PROJECT_ID.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_PROJECT_ID.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"
NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"

# Firebase Admin SDK Credentials (for verifying ID tokens in API routes)
# To get these: Settings (gear icon) -> Project settings -> Service accounts
# Click "Generate new private key". Open the downloaded JSON and copy values.
FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@YOUR_PROJECT_ID.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC..."
```

---

## Step 5: Configure Google Sign-in for Production (Optional)

When deploying to production, make sure to add your production domain (e.g., `qrjunction.in`) to the authorized domains list:
1. Go to **Authentication** -> **Settings** tab.
2. Under **Authorized domains**, click **Add domain** and enter your production domain.
