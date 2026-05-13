import { Router, Request, Response } from 'express';
import path from 'path';
import { upload } from '../middleware/upload';
import { fileStore } from '../store/fileStore';
import { UPLOAD_DIR } from '../config';

const router = Router();

router.post('/upload', upload.single('file'), (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ error: 'No file provided. Use the "file" field.' });
    return;
  }

  const id = path.basename(req.file.filename, '.pdf');
  const metadata = {
    id,
    originalName: req.file.originalname,
    storedName: req.file.filename,
    size: req.file.size,
    uploadedAt: new Date().toISOString(),
  };

  fileStore.add(metadata);
  res.status(201).json(metadata);
});

router.get('/files', (_req: Request, res: Response): void => {
  res.json(fileStore.getAll());
});

router.get('/files/:id/download', (req: Request, res: Response): void => {
  const metadata = fileStore.getById(req.params.id);

  if (!metadata) {
    res.status(404).json({ error: 'File not found.' });
    return;
  }

  const filePath = path.join(UPLOAD_DIR, metadata.storedName);
  res.download(filePath, metadata.originalName);
});

export default router;
