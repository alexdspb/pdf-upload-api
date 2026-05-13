import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({ error: 'File exceeds the 10 MB size limit.' });
    return;
  }

  if (err.message === 'INVALID_FILE_TYPE') {
    res.status(400).json({ error: 'Only PDF files are accepted.' });
    return;
  }

  res.status(500).json({ error: 'Internal server error.' });
}
