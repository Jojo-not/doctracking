# DocuTrack — React + Tailwind + Firebase CRUD

Modern document tracking CRUD application using React, Tailwind CSS, Vite, and Firebase Cloud Firestore.

## Firestore fields

- `DocummentCode`
- `Subject`
- `DateReceive`
- `ReleaseOfficeName`
- `ReceiverName`
- `Releasedate`

Firebase automatically supplies the Firestore document ID. The app also stores `createdAt` and `updatedAt` timestamps.

## Firebase setup

1. Create/open a project in Firebase Console.
2. Add a Web App.
3. Go to **Build > Firestore Database** and create the database.
4. Copy `.env.example` to `.env`.
5. Paste your Firebase Web App config values into `.env`.

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Run

```bash
npm install
npm run dev
```

The application uses the Firestore collection `documents` and listens for real-time changes with `onSnapshot`.

## Security

`firestore.rules` includes an open development rule so CRUD works immediately after you deploy the rule. Do not keep open rules in production. Add Firebase Authentication and restrict access to approved users before production deployment.
