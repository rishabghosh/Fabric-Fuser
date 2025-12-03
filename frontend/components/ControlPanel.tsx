import React, { useState, useEffect, useRef } from 'react';
import { LogoConfig } from '../types';
import { RotateCw, Move, Maximize, Layers, Keyboard } from 'lucide-react';

interface ControlPanelProps {
  config: LogoConfig;
  setConfig: React.Dispatch<React.SetStateAction<LogoConfig>>;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig }) => {
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  // Handler for arrow key input with shift modifier
  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: keyof LogoConfig,
    normalStep: number,
    shiftStep: number,
    min: number,
    max: number
  ) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const step = e.shiftKey ? shiftStep : normalStep;
      const direction = e.key === 'ArrowUp' ? 1 : -1;
      const currentValue = config[field] as number;
      const newValue = Math.max(min, Math.min(max, currentValue + (direction * step)));
      handleChange(field, newValue);
    }
  };

  useEffect(() => {
    if (!isKeyboardActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere if user is typing in an input
      if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) {
        return;
      }

      // Shift for faster movement (0.01), default 0.001 for fine tuning
      const STEP = e.shiftKey ? 0.01 : 0.001;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setConfig(prev => ({ ...prev, vertical: Math.max(0, Math.min(1, prev.vertical - STEP)) }));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setConfig(prev => ({ ...prev, vertical: Math.max(0, Math.min(1, prev.vertical + STEP)) }));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setConfig(prev => ({ ...prev, horizontal: Math.max(0, Math.min(1, prev.horizontal - STEP)) }));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setConfig(prev => ({ ...prev, horizontal: Math.max(0, Math.min(1, prev.horizontal + STEP)) }));
          break;
        case 'Escape':
           setIsKeyboardActive(false);
           break;
      }
    };

    const handleGlobalClick = (e: MouseEvent) => {
        // Deactivate if clicking outside the toggle button
        if (toggleBtnRef.current && !toggleBtnRef.current.contains(e.target as Node)) {
            setIsKeyboardActive(false);
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleGlobalClick);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('click', handleGlobalClick);
    };
  }, [isKeyboardActive, setConfig]);
  
  const handleChange = (key: keyof LogoConfig, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 p-1">
      
      {/* Position */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Move size={16} />
                <span>Position (X / Y)</span>
            </div>
            <button
                ref={toggleBtnRef}
                onClick={() => setIsKeyboardActive(!isKeyboardActive)}
                className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded-md transition-all border ${
                    isKeyboardActive 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-200 ring-offset-1' 
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
                title="Use Arrow keys to move logo"
            >
                <Keyboard size={14} />
                <span className="font-medium">{isKeyboardActive ? 'Keys Active' : 'Use Keys'}</span>
            </button>
        </div>

        {isKeyboardActive && (
            <div className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-1.5 rounded border border-indigo-100 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
                <span>Use ⬆⬇⬅➡ to move. Shift for speed.</span>
                <span className="text-indigo-400 cursor-pointer hover:text-indigo-700" onClick={(e) => { e.stopPropagation(); setIsKeyboardActive(false); }}>×</span>
            </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
                <label className="text-xs text-gray-500">Horizontal</label>
                <input
                    type="number"
                    min="0" max="1" step="0.001"
                    value={Number(config.horizontal.toFixed(3))}
                    onChange={(e) => handleChange('horizontal', parseFloat(e.target.value))}
                    onKeyDown={(e) => handleInputKeyDown(e, 'horizontal', 0.001, 0.01, 0, 1)}
                    className="w-16 text-xs p-1 border border-gray-300 rounded text-right focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white text-black"
                />
            </div>
            <input
              type="range"
              min="0" max="1" step="0.001"
              value={config.horizontal}
              onChange={(e) => handleChange('horizontal', parseFloat(e.target.value))}
              className="w-full mt-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
                <label className="text-xs text-gray-500">Vertical</label>
                <input
                    type="number"
                    min="0" max="1" step="0.001"
                    value={Number(config.vertical.toFixed(3))}
                    onChange={(e) => handleChange('vertical', parseFloat(e.target.value))}
                    onKeyDown={(e) => handleInputKeyDown(e, 'vertical', 0.001, 0.01, 0, 1)}
                    className="w-16 text-xs p-1 border border-gray-300 rounded text-right focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white text-black"
                />
            </div>
            <input
              type="range"
              min="0" max="1" step="0.001"
              value={config.vertical}
              onChange={(e) => handleChange('vertical', parseFloat(e.target.value))}
              className="w-full mt-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* Scale & Rotation */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                    <Maximize size={16} />
                    <span>Scale</span>
                </div>
                <div className="flex items-center gap-1">
                    <input
                        type="number"
                        min="1" max="300"
                        step="0.1"
                        value={(config.scale * 100).toFixed(1)}
                        onChange={(e) => handleChange('scale', parseFloat(e.target.value) / 100)}
                        onKeyDown={(e) => handleInputKeyDown(e, 'scale', 0.01, 0.1, 0.01, 3)}
                        className="w-16 text-xs p-1 border border-gray-300 rounded text-right focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white text-black"
                    />
                    <span className="text-xs text-gray-400">%</span>
                </div>
            </div>
            <input 
            type="range" 
            min="0.01" max="3" step="0.001" 
            value={config.scale} 
            onChange={(e) => handleChange('scale', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
        </div>
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                <div className="flex items-center gap-2">
                    <RotateCw size={16} />
                    <span>Rotation</span>
                </div>
                <div className="flex items-center gap-1">
                    <input
                        type="number"
                        min="0" max="360"
                        value={config.rotation}
                        onChange={(e) => handleChange('rotation', parseFloat(e.target.value))}
                        onKeyDown={(e) => handleInputKeyDown(e, 'rotation', 1, 10, 0, 360)}
                        className="w-12 text-xs p-1 border border-gray-300 rounded text-right focus:ring-1 focus:ring-indigo-500 focus:outline-none bg-white text-black"
                    />
                    <span className="text-xs text-gray-400">°</span>
                </div>
            </div>
            <input 
            type="range" 
            min="0" max="360" step="1" 
            value={config.rotation} 
            onChange={(e) => handleChange('rotation', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Blending */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Layers size={16} />
            <span>Blending & Realism</span>
        </div>

        <div className="space-y-2">
            <label className="flex justify-between text-xs text-gray-500">
                <span>Opacity</span>
                <span>{(config.opacity * 100).toFixed(0)}%</span>
            </label>
            <input 
            type="range" 
            min="0" max="1" step="0.01" 
            value={config.opacity} 
            onChange={(e) => handleChange('opacity', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
        </div>

        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-xs text-gray-500 flex items-center gap-1">
                    <span>Fold Shadow Intensity</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1 rounded border border-indigo-200">OpenCV Sim</span>
                </label>
                <span className="text-xs text-gray-500">{(config.fold_shadow_intensity * 100).toFixed(0)}%</span>
            </div>
            <input
            type="range"
            min="0" max="1" step="0.01"
            value={config.fold_shadow_intensity}
            onChange={(e) => handleChange('fold_shadow_intensity', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <p className="text-[10px] text-gray-400 leading-tight">
                Simulates displacement mapping by blending the jacket's shadows over the logo. Increase to make the logo look "embedded" in the fabric.
            </p>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;