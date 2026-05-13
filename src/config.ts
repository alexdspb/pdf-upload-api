import path from 'path';

export const UPLOAD_DIR = path.resolve('./uploads');
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
