import React, { useRef, useEffect, useState } from 'react';
import { LogoConfig } from '../types';

interface CanvasPreviewProps {
  mainImageSrc: string | null;
  logoImageSrc: string | null;
  config: LogoConfig;
}

const CanvasPreview: React.FC<CanvasPreviewProps> = ({ mainImageSrc, logoImageSrc, config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Dimensions in logical CSS pixels
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDrawing, setIsDrawing] = useState(false);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext('2d'); 
    if (!ctx) return;

    // Handle High DPI (Retina) Displays
    const dpr = window.devicePixelRatio || 1;
    
    // Set actual backing store size to physical pixels
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    
    // Normalize coordinate system to use CSS pixels
    ctx.scale(dpr, dpr);

    // Enable high quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Load images
    const mainImg = new Image();
    const logoImg = new Image();

    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        draw(ctx, mainImg, logoImg, dimensions.width, dimensions.height);
      }
    };

    if (mainImageSrc && logoImageSrc) {
      setIsDrawing(true);
      // NOTE: Remove crossOrigin for Blob URLs to avoid loading issues in some environments
      mainImg.src = mainImageSrc;
      mainImg.onload = checkLoaded;
      mainImg.onerror = () => {
        console.error("Failed to load main image");
        setIsDrawing(false);
      };

      logoImg.src = logoImageSrc;
      logoImg.onload = checkLoaded;
      logoImg.onerror = () => {
        console.error("Failed to load logo image");
        setIsDrawing(false);
      };
    } else if (mainImageSrc) {
       // Only main image
       setIsDrawing(true);
       mainImg.src = mainImageSrc;
       mainImg.onload = () => {
         // Clear using logical dimensions
         ctx.clearRect(0, 0, dimensions.width, dimensions.height);
         
         const scale = Math.min(dimensions.width / mainImg.width, dimensions.height / mainImg.height);
         const x = (dimensions.width - mainImg.width * scale) / 2;
         const y = (dimensions.height - mainImg.height * scale) / 2;
         
         ctx.drawImage(mainImg, x, y, mainImg.width * scale, mainImg.height * scale);
         setIsDrawing(false);
       };
       mainImg.onerror = () => {
         console.error("Failed to load main image");
         setIsDrawing(false);
       };
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

  }, [mainImageSrc, logoImageSrc, config, dimensions]);

  const draw = (
      ctx: CanvasRenderingContext2D, 
      mainImg: HTMLImageElement, 
      logoImg: HTMLImageElement,
      logicalWidth: number,
      logicalHeight: number
  ) => {
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    // 1. Calculate Main Image Fit (Cover or Contain logic - here Contain)
    const scaleFactor = Math.min(logicalWidth / mainImg.width, logicalHeight / mainImg.height);
    const drawW = mainImg.width * scaleFactor;
    const drawH = mainImg.height * scaleFactor;
    const offsetX = (logicalWidth - drawW) / 2;
    const offsetY = (logicalHeight - drawH) / 2;

    // 2. Draw Main Image (Base Layer)
    ctx.drawImage(mainImg, offsetX, offsetY, drawW, drawH);

    // 3. Save Context for Logo Transformation
    ctx.save();

    // 4. Transform Coordinate System for Logo
    const centerX = offsetX + (drawW * config.x);
    const centerY = offsetY + (drawH * config.y);
    
    ctx.translate(centerX, centerY);
    ctx.rotate((config.rotation * Math.PI) / 180);
    
    // Apply Scale
    // We base the scale on the "Main Image Size" on screen. 
    // This ensures if the main image scales up/down responsively, the logo stays relative to it.
    const finalScale = config.scale * scaleFactor;
    ctx.scale(finalScale, finalScale);

    // 5. Draw Logo
    // Center the logo at (0,0) in the transformed space
    const logoW = logoImg.width;
    const logoH = logoImg.height;
    
    // Global Alpha for Opacity
    ctx.globalAlpha = config.opacity;
    
    // Draw the logo centered
    ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
    
    ctx.restore();

    // 6. Simulate Folds/Wrinkles (The "Jacket Over Logo" Trick)
    if (config.displacementStrength > 0) {
      ctx.save();
      
      // Step A: Create a temporary canvas for the mask
      // Note: Temp canvas also needs to respect High DPI if we want crisp edges on the mask
      const dpr = window.devicePixelRatio || 1;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = logicalWidth * dpr;
      tempCanvas.height = logicalHeight * dpr;
      
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        // Scale temp context too
        tempCtx.scale(dpr, dpr);
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';

        // Replicate the logo placement exactly
        tempCtx.translate(centerX, centerY);
        tempCtx.rotate((config.rotation * Math.PI) / 180);
        tempCtx.scale(finalScale, finalScale);
        tempCtx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH);
        
        // Reset transform
        tempCtx.setTransform(dpr, 0, 0, dpr, 0, 0); // Keep the DPR scale
        
        // Change blend mode to keep only where the logo is
        tempCtx.globalCompositeOperation = 'source-in';
        
        // Draw the Main Image (Jacket) onto the Logo shape
        // This cuts out the "texture" of the jacket in the shape of the logo
        tempCtx.drawImage(mainImg, offsetX, offsetY, drawW, drawH);
        
        // Step B: Draw this texture over the original canvas with 'multiply'
        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = config.displacementStrength; 
        
        // Draw the temp canvas back onto the main canvas
        // Since tempCanvas is already physical size, we draw it 1:1 into the coordinate space.
        // However, our main context 'ctx' is scaled by DPR.
        // If we draw a DPR-sized image into a DPR-scaled context, it will be huge.
        // We need to draw it at logical size.
        
        // Reset main context transform momentarily to draw the physical pixel buffer 1:1? 
        // Or simply draw the tempCanvas (which acts like an image) at logical size.
        ctx.drawImage(tempCanvas, 0, 0, logicalWidth, logicalHeight);
      }
      
      ctx.restore();
    }
    
    setIsDrawing(false);
  };

  const handleDownload = () => {
    if (canvasRef.current) {
        const link = document.createElement('a');
        link.download = 'teejutsu-mockup.png';
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