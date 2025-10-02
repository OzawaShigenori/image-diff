import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { compareImages, CompareOptions } from './compare.js';
import { unlink } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { mkdtemp, rmdir } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/output', express.static(path.join(__dirname, '../output')));

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const tmpDir = await mkdtemp(join(tmpdir(), 'image-diff-'));
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only PNG files are allowed'));
    }
  }
});

/**
 * Clean up uploaded files
 *
 * @param files - Array of file paths to delete
 */
async function cleanupFiles(files: string[]) {
  await Promise.all(files.map(file => unlink(file).catch(() => {})));
}

/**
 * Compare two uploaded images
 */
app.post('/api/compare', upload.fields([
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || typeof req.files !== 'object') {
      return res.status(400).json({ error: 'Both images are required' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files.image1?.[0] || !files.image2?.[0]) {
      return res.status(400).json({ error: 'Both images are required' });
    }

    const image1Path = files.image1[0].path;
    const image2Path = files.image2[0].path;
    const outputFileName = `diff-${Date.now()}.png`;
    const outputPath = path.join(__dirname, '../output', outputFileName);

    const options: CompareOptions = {
      threshold: parseFloat(req.body.threshold || '0.1'),
      includeAA: req.body.includeAA === 'true',
      diffMask: req.body.diffMask === 'true'
    };

    const result = await compareImages(image1Path, image2Path, outputPath, options);

    await cleanupFiles([image1Path, image2Path]);

    res.json({
      ...result,
      outputUrl: `/output/${outputFileName}`
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error comparing images:', errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});