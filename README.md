# Image Diff CLI

A command-line tool for comparing PNG images using [pixelmatch](https://github.com/mapbox/pixelmatch).

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd image-diff

# Install dependencies
pnpm install

# Build the project
pnpm run build

# Link globally (optional)
pnpm link --global
```

## Usage

### Development mode

```bash
pnpm run dev <image1> <image2> [options]
```

### Production mode (after building)

```bash
node dist/cli.js <image1> <image2> [options]
```

### Global usage (after linking)

```bash
image-diff <image1> <image2> [options]
```

## Options

- `-o, --output <path>`: Path to save the diff image (default: `diff.png`)
- `-t, --threshold <number>`: Matching threshold, 0-1 (default: `0.1`)
  - Lower values make the comparison more sensitive
- `--aa, --includeAA`: Include anti-aliased pixels in diff (default: `false`)
- `-a, --alpha <number>`: Transparency of changed pixels, 0-1 (default: `1`)
- `--aaColor <r,g,b>`: Color of anti-aliased pixels (default: `255,255,0`)
- `--diffColor <r,g,b>`: Color of different pixels (default: `255,0,0`)
- `--diffColorAlt <r,g,b>`: Alternative color for different pixels
- `--diffMask`: Draw the diff over a transparent background (default: `false`)
- `-h, --help`: Show help
- `-v, --version`: Show version

## Examples

### Basic comparison

```bash
image-diff image1.png image2.png
```

### Save diff to specific location

```bash
image-diff image1.png image2.png -o output/diff.png
```

### Adjust sensitivity

```bash
# More sensitive (detects smaller differences)
image-diff image1.png image2.png -t 0.01

# Less sensitive (ignores minor differences)
image-diff image1.png image2.png -t 0.5
```

### Custom diff colors

```bash
# Blue diff pixels
image-diff image1.png image2.png --diffColor 0,0,255

# Include anti-aliased pixels in yellow
image-diff image1.png image2.png --aa --aaColor 255,255,0
```

## Exit Codes

- `0`: Images are identical (no differences found)
- `1`: Images have differences or an error occurred

## Development

### Scripts

- `pnpm run build`: Build TypeScript files
- `pnpm run dev`: Run in development mode with tsx
- `pnpm run typecheck`: Type check without building
- `pnpm run precommit`: Build and typecheck before committing

### Testing

Create test images and run comparison:

```bash
# Create test images
node test/create-test-images.js

# Compare test images
pnpm run dev test/image1.png test/image2.png -o test/diff.png
```

## License

ISC