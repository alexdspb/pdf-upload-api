import express from 'express';
import fs from 'fs';
import { UPLOAD_DIR } from './config';
import filesRouter from './routes/files';
import { errorHandler } from './middleware/errorHandler';

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const app = express();

app.use(express.json());
app.use(filesRouter);
app.use(errorHandler);

export default app;
