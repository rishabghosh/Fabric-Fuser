import React, { useRef, useEffect, useState } from 'react';
import { LogoConfig } from '../types';
import { API_CONFIG } from '../config';

interface CanvasPreviewProps {
  mainImageSrc: string | null;
  logoImageSrc: string | null;
  config: LogoConfig;
}

const CanvasPreview: React.FC<CanvasPreviewProps> = ({ mainImageSrc, logoImageSrc, config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Rate limiting: track request timestamps (max 3 per second)
  const requestTimestamps = useRef<number[]>([]);

  // Resize observer to keep canvas responsive
  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // We capture the CSS pixel size
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Function to convert blob URL to File object
  const blobUrlToFile = async (blobUrl: string, filename: string): Promise<File> => {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  };

  // Rate limiting check: allow max 3 requests per second
  const canMakeRequest = (): boolean => {
    const now = Date.now();
    const oneSecondAgo = now - 1000;

    // Remove timestamps older than 1 second
    requestTimestamps.current = requestTimestamps.current.filter(
      timestamp => timestamp > oneSecondAgo
    );

    // Check if we've made less than 3 requests in the last second
    if (requestTimestamps.current.length < 3) {
      requestTimestamps.current.push(now);
      return true;
    }

    // Rate limit exceeded - ditch this request
    console.warn('Rate limit exceeded: Max 3 requests per second. Request ditched.');
    return false;
  };

  // Function to call backend API
  const processWithBackend = async () => {
    if (!mainImageSrc || !logoImageSrc) return;

    // Rate limiting check - ditch request if limit exceeded
    if (!canMakeRequest()) {
      console.log('Request ditched due to rate limiting');
      return;
    }

    try {
      setIsDrawing(true);
      setError(null);

      // Convert blob URLs to File objects
      const mainFile = await blobUrlToFile(mainImageSrc, 'main.jpg');
      const logoFile = await blobUrlToFile(logoImageSrc, 'logo.png');

      // Prepare form data
      const formData = new FormData();
      formData.append('main_image', mainFile);
      formData.append('logo_image', logoFile);
      formData.append('config', JSON.stringify({
        horizontal: config.horizontal,
        vertical: config.vertical,
        scale: config.scale,
        rotation: config.rotation,
        opacity: config.opacity,
        fold_shadow_intensity: config.fold_shadow_intensity
      }));

      // Call backend API
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.OVERLAY}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.statusText}`);
      }

      // Get the image blob and create object URL
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setProcessedImage(imageUrl);
      setIsDrawing(false);
    } catch (err) {
      console.error('Error processing with backend:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
      setIsDrawing(false);
    }
  };

  // Trigger backend processing when images or config change
  useEffect(() => {
    if (mainImageSrc && logoImageSrc) {
      processWithBackend();
    } else {
      setProcessedImage(null);
      setError(null);
    }
  }, [mainImageSrc, logoImageSrc, config]);

  // Draw the result on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle High DPI (Retina) Displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Enable high quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (processedImage) {
      // Draw processed image from backend
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);
        const scale = Math.min(dimensions.width / img.width, dimensions.height / img.height);
        const x = (dimensions.width - img.width * scale) / 2;
        const y = (dimensions.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      };
      img.src = processedImage;
    } else if (mainImageSrc && !logoImageSrc) {
      // Only main image
      const mainImg = new Image();
      mainImg.onload = () => {
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);
        const scale = Math.min(dimensions.width / mainImg.width, dimensions.height / mainImg.height);
        const x = (dimensions.width - mainImg.width * scale) / 2;
        const y = (dimensions.height - mainImg.height * scale) / 2;
        ctx.drawImage(mainImg, x, y, mainImg.width * scale, mainImg.height * scale);
      };
      mainImg.src = mainImageSrc;
    } else {
      // Empty state
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '16px sans-serif';
      ctx.fillText("Upload Main Image and Logo", dimensions.width / 2, dimensions.height / 2);
    }
  }, [processedImage, mainImageSrc, logoImageSrc, dimensions]);

  const handleDownload = () => {
    if (canvasRef.current) {
        const link = document.createElement('a');
        link.download = 'fabricfuser-mockup.png';
        link.href = canvasRef.current.toDataURL('image/png', 1.0); // Max quality
        link.click();
    }
  };

  return (
    <div className="relative w-full h-full bg-[#e5e5e5] rounded-xl overflow-hidden shadow-inner border border-gray-200" ref={containerRef}>
      <canvas 
        ref={canvasRef}
        style={{ width: dimensions.width, height: dimensions.height }}
        className="block"
      />
      {isDrawing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-500/10 backdrop-blur-sm">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-md text-center">
            <p className="font-semibold">Error</p>
            <p className="text-sm mt-1">{error}</p>
            <p className="text-xs mt-2 opacity-80">Make sure the backend is running on port 8000</p>
          </div>
        </div>
      )}
      {(mainImageSrc && logoImageSrc) && (
          <button 
            onClick={handleDownload}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-lg shadow-lg transition-all z-10"
            title="Download Result"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          </button>
      )}
    </div>
  );
};

export default CanvasPreview;