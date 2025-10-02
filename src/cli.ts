#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { compareImages } from './compare.js';
import { resolve } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

/**
 * CLI entry point for image comparison tool
 *
 * @description Parses command line arguments and executes image comparison
 * @example
 * ```bash
 * # Compare two images and save the diff
 * image-diff image1.png image2.png -o diff.png
 *
 * # Compare with custom threshold
 * image-diff image1.png image2.png -o diff.png -t 0.2
 * ```
 */
const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 <image1> <image2> [options]')
  .command('$0 <image1> <image2>', 'Compare two images', (yargs) => {
    return yargs
      .positional('image1', {
        describe: 'Path to the first image',
        type: 'string',
        demandOption: true,
      })
      .positional('image2', {
        describe: 'Path to the second image',
        type: 'string',
        demandOption: true,
      });
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Path to save the diff image',
    default: 'diff.png',
  })
  .option('threshold', {
    alias: 't',
    type: 'number',
    description: 'Matching threshold (0-1, less is more sensitive)',
    default: 0.1,
  })
  .option('includeAA', {
    alias: 'aa',
    type: 'boolean',
    description: 'Include anti-aliased pixels in diff',
    default: false,
  })
  .option('alpha', {
    alias: 'a',
    type: 'number',
    description: 'Transparency of changed pixels (0-1)',
    default: 1,
  })
  .option('aaColor', {
    type: 'string',
    description: 'Color of anti-aliased pixels (comma-separated RGB)',
    default: '255,255,0',
  })
  .option('diffColor', {
    type: 'string',
    description: 'Color of different pixels (comma-separated RGB)',
    default: '255,0,0',
  })
  .option('diffColorAlt', {
    type: 'string',
    description: 'Alternative color for different pixels',
  })
  .option('diffMask', {
    type: 'boolean',
    description: 'Draw the diff over a transparent background',
    default: false,
  })
  .option('open', {
    type: 'boolean',
    description: 'Open the diff image after creation',
    default: false,
  })
  .help()
  .alias('help', 'h')
  .alias('version', 'v')
  .parseSync();

/**
 * Parse color string to RGB array
 *
 * @param colorString - Comma-separated RGB values (e.g., "255,0,0")
 * @returns RGB array [r, g, b]
 */
function parseColor(colorString: string): [number, number, number] {
  const parts = colorString.split(',').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid color format: ${colorString}. Use format: "r,g,b"`);
  }
  return parts as [number, number, number];
}

/**
 * Main function to execute image comparison
 */
async function main() {
  try {
    const image1Path = resolve(argv.image1 as string);
    const image2Path = resolve(argv.image2 as string);
    const outputPath = resolve(argv.output);

    const options = {
      threshold: argv.threshold,
      includeAA: argv.includeAA,
      alpha: argv.alpha,
      aaColor: parseColor(argv.aaColor),
      diffColor: parseColor(argv.diffColor),
      diffColorAlt: argv.diffColorAlt ? parseColor(argv.diffColorAlt) : undefined,
      diffMask: argv.diffMask,
    };

    console.log(`Comparing images...`);
    console.log(`  Image 1: ${image1Path}`);
    console.log(`  Image 2: ${image2Path}`);
    console.log(`  Output:  ${outputPath}`);
    console.log(`  Options:`, {
      ...options,
      aaColor: argv.aaColor,
      diffColor: argv.diffColor,
      diffColorAlt: argv.diffColorAlt,
    });

    const result = await compareImages(image1Path, image2Path, outputPath, options);

    console.log(`\nComparison complete!`);
    console.log(`  Pixels different: ${result.mismatchedPixels}`);
    console.log(`  Difference ratio: ${(result.differenceRatio * 100).toFixed(2)}%`);
    console.log(`  Diff image saved: ${outputPath}`);

    if (argv.open) {
      const execAsync = promisify(exec);
      try {
        if (process.platform === 'darwin') {
          await execAsync(`open "${outputPath}"`);
        } else if (process.platform === 'win32') {
          await execAsync(`start "${outputPath}"`);
        } else {
          await execAsync(`xdg-open "${outputPath}"`);
        }
        console.log(`  Diff image opened in default viewer`);
      } catch (error) {
        console.log(`  Could not open image automatically`);
      }
    }

    if (result.mismatchedPixels > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();