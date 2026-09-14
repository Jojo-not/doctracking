# DocuTrack — React + Tailwind CRUD Website

A modern document tracking CRUD application built with React, Vite, and Tailwind CSS.

## Fields

- `DocummentCode`
- `Subject`
- `DateReceive`
- `ReleaseOfficeName`
- `ReceiverName`
- `Releasedate`

## Features

- Create document records
- Read/view document records
- Update existing document records
- Delete records with confirmation
- Search records
- Filter by Released / Pending status
- Dashboard statistics
- Pagination
- Responsive desktop and mobile design
- LocalStorage persistence
- Duplicate Document Code validation
- Release Date validation

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite in your terminal.

## Production build

```bash
npm run build
npm run preview
```

## Important

This starter uses browser LocalStorage, so it does not require a backend or database.
To make the data shared across multiple users/computers, connect the CRUD operations
to an API and database such as Node.js/Express + MySQL/PostgreSQL.
