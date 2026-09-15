# DocuTrack — React + Tailwind + Firebase

DocuTrack is a document monitoring CRUD application using React, Tailwind CSS, Firebase Authentication, Cloud Firestore, and Excel export.

## Administrator

The dedicated administrator account for this build is:

```text
jowen.diez@deped.gov.ph
```

When that Firebase Authentication account logs in, DocuTrack automatically recognizes it as the administrator. You no longer need to manually create an `admins/{uid}` Firestore document.

## Admin Dashboard

The administrator gets a dedicated **Admin Dashboard** page with:

- Registered user count
- Pending approval count
- Approved account count
- Total document count
- User account search
- Approve pending registrations
- Reject registrations
- Revoke approved-user access
- Administrator identity display

The Admin Dashboard is visible only to the configured admin account.

## Account approval flow

1. A user signs up with name, email, and password.
2. Firebase Authentication creates the account.
3. Firestore creates `/users/{uid}` with `approved: false` and `status: "pending"`.
4. The user sees the Pending Approval screen.
5. The administrator logs in and opens **Admin Dashboard**.
6. The administrator approves or rejects the account.
7. Approved users receive document Create/Edit/Delete access.

Guests can still search, view, and export documents without modifying them.

## Important: publish the included Firestore rules

Open:

**Firebase Console → Firestore Database → Rules**

Replace the rules with the included `firestore.rules` file and click **Publish**.

These rules recognize the administrator using the authenticated Firebase email:

```text
jowen.diez@deped.gov.ph
```

This means the admin restriction is enforced by Firestore and not only by the React interface.

## Firebase Authentication

Make sure **Email/Password** authentication is enabled:

**Firebase Console → Authentication → Sign-in method → Email/Password → Enable**

Also make sure `jowen.diez@deped.gov.ph` exists in **Authentication → Users**. If it does not exist yet, create/sign up that account first.

## Environment variables

Create `.env` from `.env.example`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=docutra-c8890.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=docutra-c8890
VITE_FIREBASE_STORAGE_BUCKET=docutra-c8890.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1082727175874
VITE_FIREBASE_APP_ID=1:1082727175874:web:c191fa4334457b208ecd5b
```

For Vercel, enter these under **Project → Settings → Environment Variables**, then redeploy.

## Document features

- Create, view, edit, and delete documents for approved users
- Guest view/search access
- Excel `.xlsx` export
- Automatic status:
  - `EndorsedTo = BHROD-HRDD` → **Endorsed**
  - Any other value → **Release**
- `Encoded By` automatically stores the user who created or last updated the record

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Document status rules

Document status is calculated automatically from `EndorsedTo`:

- Blank `EndorsedTo` -> `Pending`
- `NA` (case-insensitive) -> `Pending`
- `BHROD-HRDD` (case-insensitive) -> `Endorsed`
- Any other non-empty value -> `Release`

The document list, status filter, detail view, dashboard counters, and Excel export use this automatic status.
