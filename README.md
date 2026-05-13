# PDF Upload API

A REST API for uploading, listing, and downloading PDF files. Built with Node.js, TypeScript, and Express.

## Setup

```bash
npm install
```

## Running Locally

**Development:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

The server starts on port `3000` by default. Override with the `PORT` environment variable.

## Running with Docker

```bash
docker compose up --build
```

The API will be available at `http://localhost:3000`. Uploaded files are persisted in `./uploads` and survive container rebuilds.

## Running Tests

```bash
npm test
```

## API

### Upload a PDF

```
POST /upload
Content-Type: multipart/form-data
```

Field: `file` — PDF file, max 10 MB

```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@document.pdf"
```

**201 Created:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "originalName": "document.pdf",
  "storedName": "550e8400-e29b-41d4-a716-446655440000.pdf",
  "size": 204800,
  "uploadedAt": "2026-01-01T12:00:00.000Z"
}
```

Errors: `400` non-PDF or missing file · `413` exceeds 10 MB

---

### List Uploaded Files

```
GET /files
```

```bash
curl http://localhost:3000/files
```

**200 OK:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "originalName": "document.pdf",
    "storedName": "550e8400-e29b-41d4-a716-446655440000.pdf",
    "size": 204800,
    "uploadedAt": "2026-01-01T12:00:00.000Z"
  }
]
```

> The file list is stored in memory and resets on server restart.

---

### Download a File

```
GET /files/:id/download
```

```bash
curl -O -J http://localhost:3000/files/550e8400-e29b-41d4-a716-446655440000/download
```

**200 OK:** Returns the PDF as an attachment with the original filename.

Errors: `404` file not found
