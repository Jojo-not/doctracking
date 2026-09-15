# DocuTrack — React + Tailwind + Firebase Auth + Firestore

A modern document tracking CRUD application using React, Vite, Tailwind CSS, Firebase Authentication, and Cloud Firestore.

## Current fields

- `DocummentCode`
- `Subject`
- `DateReceive`
- `EndorsedTo`
- `Name`
- `Releasedate`
- `Status` — automatic

### Automatic status rule

- If `EndorsedTo` equals `BHROD-HRDD` (case-insensitive), status is **Endorsed**.
- Otherwise, status is **Release**.

The app can still display older Firestore records that use `ReleaseOfficeName` and `ReceiverName`. When an old record is edited, those legacy fields are replaced by `EndorsedTo` and `Name`.

## Access levels

### Signed-in user

- Create records
- View/search records
- Edit records
- Delete records

### Guest

- View records only
- Search records
- Filter by status
- Cannot create, edit, or delete

## Firebase Authentication setup

In Firebase Console:

1. Open **Build → Authentication**.
2. Click **Get started** if Authentication has not been initialized.
3. Open **Sign-in method**.
4. Enable **Email/Password**.

The app has Login and Sign Up forms using Firebase Email/Password Authentication.

## Firestore rules

Publish the included `firestore.rules` in **Firestore Database → Rules**:

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /documents/{documentId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

This allows public guest reads while requiring login for CRUD writes.

## Environment variables

Copy `.env.example` to `.env` for local development and add your Firebase Web App configuration.

On Vercel, add the same variables under:

**Project → Settings → Environment Variables**

Then redeploy after changing environment variables.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
```

## Encoder audit and document view

- New documents automatically save `EncodedBy` using the signed-in user's Firebase display name (with email fallback).
- `EncodedByUid` stores the Firebase user UID for audit purposes.
- Guests and authenticated users can open a read-only **View Document** modal.
- The document list shows/searches the encoder name.
- Older records without `EncodedBy` fall back to their existing `createdBy` value.

## Excel export

The document list includes a **Download Excel** button. It exports the records currently matching the search and status filter to an `.xlsx` workbook named like `DocuTrack_Documents_2026-09-15.xlsx`. The export is available to both signed-in users and guests because it does not modify Firebase data.

Exported columns:

- No.
- Document Code
- Subject
- Date Received
- Endorsed To
- Name
- Release Date
- Status
- Encoded By

## Encoded By update behavior

Whenever an authenticated user edits and saves a document, `EncodedBy` and `EncodedByUid` are replaced with that user’s current display name/email and UID.

## Guest page update

The public guest page no longer displays a Login / Sign Up button in the header. Guests can still search, view document details, and download the document list in Excel format.
