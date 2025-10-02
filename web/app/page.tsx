'use client';

import { useState, useCallback } from 'react';

interface CompareResult {
  mismatchedPixels: number;
  totalPixels: number;
  differenceRatio: number;
  outputUrl: string;
}

export default function Home() {
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(0.1);
  const [includeAA, setIncludeAA] = useState(false);
  const [diffMask, setDiffMask] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<{
    image1: string | null;
    image2: string | null;
  }>({ image1: null, image2: null });
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay'>('side-by-side');

  const handleFileChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement>,
    imageNumber: 1 | 2
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'image/png') {
        setError('Only PNG files are supported');
        return;
      }

      const url = URL.createObjectURL(file);

      if (imageNumber === 1) {
        setImage1(file);
        setPreviewUrls(prev => ({ ...prev, image1: url }));
      } else {
        setImage2(file);
        setPreviewUrls(prev => ({ ...prev, image2: url }));
      }

      setError(null);
      setResult(null);
    }
  }, []);

  const compareImages = useCallback(async () => {
    if (!image1 || !image2) {
      setError('Please select both images');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image1', image1);
    formData.append('image2', image2);
    formData.append('threshold', threshold.toString());
    formData.append('includeAA', includeAA.toString());
    formData.append('diffMask', diffMask.toString());

    try {
      const response = await fetch('http://localhost:3001/api/compare', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Comparison failed');
      }

      const data = await response.json();
      setResult({
        ...data,
        outputUrl: `http://localhost:3001${data.outputUrl}`
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [image1, image2, threshold, includeAA, diffMask]);

  const reset = useCallback(() => {
    setImage1(null);
    setImage2(null);
    setResult(null);
    setError(null);
    if (previewUrls.image1) URL.revokeObjectURL(previewUrls.image1);
    if (previewUrls.image2) URL.revokeObjectURL(previewUrls.image2);
    setPreviewUrls({ image1: null, image2: null });
  }, [previewUrls]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Image Comparison Tool
          </h1>
          <p className="text-lg text-gray-600">
            Upload two PNG images to compare them pixel by pixel
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Image 1</h2>
            <label className="block mb-4">
              <input
                type="file"
                accept="image/png"
                onChange={(e) => handleFileChange(e, 1)}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
              />
            </label>
            {previewUrls.image1 && (
              <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={previewUrls.image1}
                  alt="Image 1 preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Image 2</h2>
            <label className="block mb-4">
              <input
                type="file"
                accept="image/png"
                onChange={(e) => handleFileChange(e, 2)}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
              />
            </label>
            {previewUrls.image2 && (
              <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={previewUrls.image2}
                  alt="Image 2 preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Options</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Threshold: {threshold}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAA}
                  onChange={(e) => setIncludeAA(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Include Anti-aliasing
                </span>
              </label>
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={diffMask}
                  onChange={(e) => setDiffMask(e.target.checked)}
                  className="mr-2 h-4 w-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Diff Mask
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={compareImages}
            disabled={!image1 || !image2 || isLoading}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg
              hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
              transition-colors duration-200"
          >
            {isLoading ? 'Comparing...' : 'Compare Images'}
          </button>

          <button
            onClick={reset}
            className="px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg
              hover:bg-gray-300 transition-colors duration-200"
          >
            Reset
          </button>
        </div>

        {result && (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              Comparison Result
            </h2>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600">Mismatched Pixels</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.mismatchedPixels.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Pixels</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {result.totalPixels.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Difference</div>
                  <div className={`text-2xl font-bold ${
                    result.differenceRatio < 0.01 ? 'text-green-600' :
                    result.differenceRatio < 0.05 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {(result.differenceRatio * 100).toFixed(4)}%
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">Match Quality</div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      result.differenceRatio < 0.01
                        ? 'bg-green-500'
                        : result.differenceRatio < 0.05
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${100 - result.differenceRatio * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex gap-2 justify-center mb-4">
                <button
                  onClick={() => setViewMode('side-by-side')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    viewMode === 'side-by-side'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Side by Side
                </button>
                <button
                  onClick={() => setViewMode('overlay')}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    viewMode === 'overlay'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Overlay
                </button>
              </div>
            </div>

            {viewMode === 'side-by-side' ? (
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-gray-700 text-center">Original 1</h3>
                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                    {previewUrls.image1 && (
                      <img
                        src={previewUrls.image1}
                        alt="Original 1"
                        className="w-full h-auto"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-gray-700 text-center">Difference</h3>
                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={result.outputUrl}
                      alt="Difference"
                      className="w-full h-auto"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-gray-700 text-center">Original 2</h3>
                  <div className="bg-gray-100 rounded-lg overflow-hidden">
                    {previewUrls.image2 && (
                      <img
                        src={previewUrls.image2}
                        alt="Original 2"
                        className="w-full h-auto"
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative max-w-2xl mx-auto">
                <h3 className="text-sm font-semibold mb-2 text-gray-700 text-center">Overlay View</h3>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  {previewUrls.image1 && (
                    <img
                      src={previewUrls.image1}
                      alt="Base"
                      className="w-full h-auto"
                    />
                  )}
                  <img
                    src={result.outputUrl}
                    alt="Overlay"
                    className="absolute top-0 left-0 w-full h-auto opacity-50"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <a
                href={result.outputUrl}
                download={`diff-${Date.now()}.png`}
                className="inline-flex items-center px-6 py-2 bg-green-600 text-white font-semibold rounded-lg
                  hover:bg-green-700 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Diff Image
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}