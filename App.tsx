import React, { useState, useCallback } from 'react';
import { Upload, Code, Image as ImageIcon, Github, Scissors, Terminal, ScrollText } from 'lucide-react';
import { LogoConfig, DEFAULT_CONFIG } from './types';
import CanvasPreview from './components/CanvasPreview';
import ControlPanel from './components/ControlPanel';
import { CodeGenerator } from './utils/codeGenerator';

const App: React.FC = () => {
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [mainImageName, setMainImageName] = useState<string>('jacket.jpg');
  const [logoImageName, setLogoImageName] = useState<string>('logo.png');
  
  const [config, setConfig] = useState<LogoConfig>(DEFAULT_CONFIG);
  const [showCode, setShowCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'json' | 'python' | 'batch'>('json');

  // File Upload Handlers
  const handleMainUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImage(URL.createObjectURL(e.target.files[0]));
      setMainImageName(e.target.files[0].name);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoImage(URL.createObjectURL(e.target.files[0]));
      setLogoImageName(e.target.files[0].name);
    }
  };

  // Load defaults for demo purposes if nothing is uploaded
  React.useEffect(() => {
    // Only set defaults if user hasn't interacted yet
  }, []);

  const generator = new CodeGenerator(config);
  const pythonCode = generator.generatePythonCode(mainImageName, logoImageName);
  const batchCode = generator.generateBatchCode(logoImageName);
  
  const configJson = JSON.stringify({
    horizontal: Number(config.x.toFixed(3)),
    vertical: Number(config.y.toFixed(3)),
    scale: Number(config.scale.toFixed(3)),
    rotation: Math.round(config.rotation),
    opacity: Number(config.opacity.toFixed(2)),
    fold_shadow_intensity: Number(config.displacementStrength.toFixed(2))
  }, null, 2);

  const getDisplayContent = () => {
      switch(activeTab) {
          case 'python': return pythonCode;
          case 'batch': return batchCode;
          default: return configJson;
      }
  };

  const getCopyLabel = () => {
      switch(activeTab) {
          case 'python': return 'Source';
          case 'batch': return 'Script';
          default: return 'JSON';
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Scissors size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">TeeJutsu</h1>
            <span className="hidden sm:inline-block text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
              Mockup Generator
            </span>
          </div>
          <div className="flex items-center gap-4">
             <a href="https://github.com/google/genai" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors">
                <Github size={20} />
             </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Canvas Preview (Main) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-[600px] lg:h-[700px]">
              <CanvasPreview 
                mainImageSrc={mainImage} 
                logoImageSrc={logoImage} 
                config={config} 
              />
            </div>
            
            {/* Quick Tips */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
              <div className="text-blue-500 mt-1"><ImageIcon size={18} /></div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900">Pro Tip</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Upload a high-contrast jacket image for the best "fold" simulation. The app uses the luminance of the main image to shadow the logo.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Controls & Uploads */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <h2 className="text-sm uppercase tracking-wide text-gray-500 font-semibold mb-2">Assets</h2>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Main Image Upload */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Apparel / Object</label>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-colors group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {mainImage ? (
                        <img src={mainImage} alt="Main" className="h-16 w-full object-contain opacity-80" />
                      ) : (
                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-indigo-500" />
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleMainUpload} />
                  </label>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Logo / Graphic</label>
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-colors group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                       {logoImage ? (
                        <img src={logoImage} alt="Logo" className="h-16 w-full object-contain opacity-80" />
                      ) : (
                        <Upload className="w-6 h-6 text-gray-400 group-hover:text-indigo-500" />
                      )}
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>
            </div>

            {/* Controls Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm uppercase tracking-wide text-gray-500 font-semibold">Configuration</h2>
              </div>
              <ControlPanel config={config} setConfig={setConfig} />
            </div>

            {/* Developer Console / Code Generator Section */}
            <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 overflow-hidden flex flex-col flex-1 min-h-[200px]">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setActiveTab('json')}
                        className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider transition-colors ${
                        activeTab === 'json' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <Terminal size={14} />
                        <span>Console</span>
                    </button>
                    <div className="w-px h-3 bg-gray-700"></div>
                    <button
                        onClick={() => setActiveTab('python')}
                        className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider transition-colors ${
                        activeTab === 'python' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <Code size={14} />
                        <span>Python</span>
                    </button>
                    <div className="w-px h-3 bg-gray-700"></div>
                    <button
                        onClick={() => setActiveTab('batch')}
                        className={`flex items-center gap-2 text-xs font-medium uppercase tracking-wider transition-colors ${
                        activeTab === 'batch' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        <ScrollText size={14} />
                        <span>Batch</span>
                    </button>
                </div>
                <button 
                  onClick={() => setShowCode(!showCode)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors"
                >
                  {showCode ? 'Minimize' : 'Expand'}
                </button>
              </div>
              
              <div className={`relative transition-all duration-300 ${showCode ? 'h-[400px]' : 'h-[200px]'}`}>
                <pre className="absolute inset-0 p-4 overflow-auto text-xs font-mono text-gray-300 leading-relaxed custom-scrollbar bg-[#0d1117]">
                  <code>{getDisplayContent()}</code>
                </pre>
                <div className="absolute top-4 right-4 z-10">
                   <button 
                    onClick={() => navigator.clipboard.writeText(getDisplayContent())}
                    className="bg-white/5 hover:bg-white/10 text-white text-[10px] px-2.5 py-1.5 rounded border border-white/10 backdrop-blur-md transition-colors flex items-center gap-1.5"
                   >
                     <span>Copy {getCopyLabel()}</span>
                   </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;