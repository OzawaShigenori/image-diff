import { createReadStream, createWriteStream } from 'fs';
import { access } from 'fs/promises';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

/**
 * Options for image comparison
 */
export interface CompareOptions {
  threshold?: number;
  includeAA?: boolean;
  alpha?: number;
  aaColor?: [number, number, number];
  diffColor?: [number, number, number];
  diffColorAlt?: [number, number, number];
  diffMask?: boolean;
}

/**
 * Result of image comparison
 */
export interface CompareResult {
  mismatchedPixels: number;
  totalPixels: number;
  differenceRatio: number;
}

/**
 * Load PNG image from file path
 *
 * @param path - Path to the PNG file
 * @returns Promise resolving to PNG object
 * @throws Error if file cannot be read or is not a valid PNG
 */
async function loadPNG(path: string): Promise<PNG> {
  try {
    await access(path);
  } catch {
    throw new Error(`File not found: ${path}`);
  }

  return new Promise((resolve, reject) => {
    const png = new PNG();
    const stream = createReadStream(path)
      .pipe(png)
      .on('parsed', function () {
        resolve(png);
      })
      .on('error', (error) => {
        reject(new Error(`Failed to parse PNG file ${path}: ${error.message}`));
      });
  });
}

/**
 * Save PNG image to file
 *
 * @param png - PNG object to save
 * @param path - Path where to save the PNG file
 * @returns Promise that resolves when file is saved
 */
async function savePNG(png: PNG, path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    png
      .pack()
      .pipe(createWriteStream(path))
      .on('finish', () => resolve())
      .on('error', (error) => {
        reject(new Error(`Failed to save PNG file ${path}: ${error.message}`));
      });
  });
}

/**
 * Compare two images and generate a diff image
 *
 * @description Uses pixelmatch to compare two PNG images pixel by pixel
 * @param image1Path - Path to the first image
 * @param image2Path - Path to the second image
 * @param outputPath - Path where to save the diff image
 * @param options - Comparison options
 * @returns Promise resolving to comparison results
 * @throws Error if images have different dimensions or files cannot be processed
 * @example
 * ```typescript
 * const result = await compareImages('image1.png', 'image2.png', 'diff.png', {
 *   threshold: 0.1,
 *   includeAA: false
 * });
 * console.log(`${result.differenceRatio * 100}% different`);
 * ```
 */
export async function compareImages(
  image1Path: string,
  image2Path: string,
  outputPath: string,
  options: CompareOptions = {}
): Promise<CompareResult> {
  const [img1, img2] = await Promise.all([
    loadPNG(image1Path),
    loadPNG(image2Path),
  ]);

  const { width: width1, height: height1 } = img1;
  const { width: width2, height: height2 } = img2;

  if (width1 !== width2 || height1 !== height2) {
    throw new Error(
      `Image dimensions don't match: ` +
      `Image 1 (${width1}x${height1}) vs Image 2 (${width2}x${height2})`
    );
  }

  const diff = new PNG({ width: width1, height: height1 });

  const mismatchedPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width1,
    height1,
    options
  );

  await savePNG(diff, outputPath);

  const totalPixels = width1 * height1;
  const differenceRatio = mismatchedPixels / totalPixels;

  return {
    mismatchedPixels,
    totalPixels,
    differenceRatio,
  };
}