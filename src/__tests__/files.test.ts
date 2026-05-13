import request from 'supertest';
import path from 'path';
import fs from 'fs';
import app from '../app';
import { fileStore } from '../store/fileStore';
import { UPLOAD_DIR } from '../config';

const FIXTURES_DIR = path.join(__dirname, 'fixtures');

const MINIMAL_PDF = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n' +
  'xref\n0 2\n0000000000 65535 f\n0000000009 00000 n\n' +
  'trailer\n<< /Size 2 /Root 1 0 R >>\nstartxref\n9\n%%EOF'
);

const uploadedFiles: string[] = [];

function trackUpload(storedName: string): void {
  uploadedFiles.push(storedName);
}

beforeAll(() => {
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  fs.writeFileSync(path.join(FIXTURES_DIR, 'test.pdf'), MINIMAL_PDF);
  fs.writeFileSync(path.join(FIXTURES_DIR, 'test.txt'), 'not a pdf');
});

afterEach(() => {
  fileStore.clear();
});

afterAll(() => {
  fs.rmSync(FIXTURES_DIR, { recursive: true, force: true });
  for (const filename of uploadedFiles) {
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

describe('POST /upload', () => {
  it('returns 201 with metadata for a valid PDF', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('file', path.join(FIXTURES_DIR, 'test.pdf'), { contentType: 'application/pdf' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ originalName: 'test.pdf' });
    expect(res.body.id).toBeDefined();
    expect(res.body.storedName).toMatch(/^[0-9a-f-]+\.pdf$/);
    expect(res.body.size).toBeGreaterThan(0);
    expect(res.body.uploadedAt).toBeDefined();
    trackUpload(res.body.storedName);
  });

  it('returns 400 for a non-PDF file', async () => {
    const res = await request(app)
      .post('/upload')
      .attach('file', path.join(FIXTURES_DIR, 'test.txt'), { contentType: 'text/plain' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 413 for a file exceeding 10 MB', async () => {
    const largePdfPath = path.join(FIXTURES_DIR, 'large.pdf');
    const buf = Buffer.alloc(11 * 1024 * 1024);
    buf.write('%PDF-1.4');
    fs.writeFileSync(largePdfPath, buf);

    const res = await request(app)
      .post('/upload')
      .attach('file', largePdfPath, { contentType: 'application/pdf' });

    expect(res.status).toBe(413);
    fs.unlinkSync(largePdfPath);
  });

  it('returns 400 when no file field is sent', async () => {
    const res = await request(app).post('/upload');
    expect(res.status).toBe(400);
  });
});

describe('GET /files', () => {
  it('returns an empty array when no files have been uploaded', async () => {
    const res = await request(app).get('/files');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns uploaded files in the list', async () => {
    const uploadRes = await request(app)
      .post('/upload')
      .attach('file', path.join(FIXTURES_DIR, 'test.pdf'), { contentType: 'application/pdf' });
    trackUpload(uploadRes.body.storedName);

    const res = await request(app).get('/files');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(uploadRes.body.id);
  });
});

describe('GET /files/:id/download', () => {
  let fileId: string;
  let storedName: string;

  beforeEach(async () => {
    const res = await request(app)
      .post('/upload')
      .attach('file', path.join(FIXTURES_DIR, 'test.pdf'), { contentType: 'application/pdf' });
    fileId = res.body.id;
    storedName = res.body.storedName;
    trackUpload(storedName);
  });

  it('returns the file with 200 and correct content-type', async () => {
    const res = await request(app).get(`/files/${fileId}/download`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).get('/files/00000000-0000-0000-0000-000000000000/download');
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
