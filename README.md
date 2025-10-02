# Image Diff

A comprehensive tool for comparing PNG images using [pixelmatch](https://github.com/mapbox/pixelmatch). Available as both a command-line interface and a web application.

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

### Web Application

Start both the API server and web application:

```bash
# Start API server (Express)
pnpm run server:dev

# Start web application (Next.js) - in another terminal
cd web
pnpm install
pnpm run dev
```

Then open your browser to:
- **Web App**: http://localhost:3002 (or available port)
- **API Server**: http://localhost:3001

#### Web Features
- **Drag & Drop Upload**: Upload two PNG images for comparison
- **Real-time Preview**: See uploaded images before comparison
- **Interactive Options**: Adjust threshold, anti-aliasing, and diff mask settings
- **Multiple View Modes**:
  - **Side by Side**: View original images and diff side by side
  - **Overlay**: Overlay diff on original image
- **Statistics Display**: Shows mismatched pixels, total pixels, and difference ratio
- **Download Results**: Save diff image to your computer

### Command Line Interface

#### Development mode

```bash
pnpm run dev <image1> <image2> [options]
```

#### Production mode (after building)

```bash
node dist/cli.js <image1> <image2> [options]
```

#### Global usage (after linking)

```bash
image-diff <image1> <image2> [options]
```

## CLI Options

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
- `pnpm run dev`: Run CLI in development mode with tsx
- `pnpm run server`: Start Express API server
- `pnpm run server:dev`: Start Express server with hot reload
- `pnpm run typecheck`: Type check without building
- `pnpm run precommit`: Build and typecheck before committing

### Testing

Create test images and run comparison:

```bash
# Create test images
node test/create-test-images.js

# Compare test images using CLI
pnpm run dev test/image1.png test/image2.png -o test/diff.png

# Test web application
# 1. Start servers
pnpm run server:dev
cd web && pnpm run dev

# 2. Open http://localhost:3002 and upload test images
```

## Architecture

```
image-diff/
├── src/
│   ├── compare.ts      # Core image comparison logic
│   ├── cli.ts          # Command line interface
│   └── server.ts       # Express API server
├── web/                # Next.js web application
│   ├── app/
│   │   └── page.tsx    # Main comparison UI
│   └── package.json
├── output/             # Generated diff images
└── test/               # Test images and utilities
```

### API Endpoints

- `POST /api/compare`: Upload two images and get comparison result
- `GET /output/:filename`: Serve generated diff images
- `GET /health`: Health check endpoint

## License

ISC