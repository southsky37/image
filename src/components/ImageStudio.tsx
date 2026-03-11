import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Download, Image as ImageIcon, Loader2, Sparkles, AlertCircle, FileImage, FileCode2, User } from 'lucide-react';
import { convertImageToSVG } from '../utils/imageTracer';

type StyleOption = 'health-letter' | 'ocare-character';

const STYLE_PROMPTS: Record<StyleOption, string> = {
  'health-letter': 'Flat vector illustration, 2D digital art, borderless shapes, absolutely no black outlines. Solid muted color background with extremely minimal or no background patterns. Flat shading, no gradients. Use symbolic graphic elements (e.g., simple pain lines) very sparingly. Strictly avoid complex geometric patterns and traditional medical symbols (like caduceus). Include circular inset bubbles to show zoomed-in details of symptoms. Clean, approachable medical and healthcare editorial style. No text, no typography, no words, no letters.',
  'ocare-character': 'A cute, friendly 3D-style mascot character with a warm smile, wearing a healthcare uniform or accessories, bright and cheerful colors, soft studio lighting, high quality render, no text, no typography, no words, no letters.'
};

const PERSON_PROMPTS: Record<StyleOption, string> = {
  'health-letter': 'Simplified character design, dot eyes, rosy cheeks, flat hair blocks. Bust portrait, profile, or back view. Exaggerated visual symptoms like red inflammation or green nausea.',
  'ocare-character': 'Human character, expressive cute face, warm smile, friendly human features.'
};

interface ImageStudioProps {
  apiKey: string;
  onClearKey: () => void;
}

export function ImageStudio({ apiKey, onClearKey }: ImageStudioProps) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<StyleOption>('health-letter');
  const [includePerson, setIncludePerson] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultSvg, setResultSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('어떤 이미지가 필요하신가요? 프롬프트를 입력해주세요.');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setResultImage(null);
    setResultSvg(null);

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      
      // Translate prompt to English
      let translatedPrompt = prompt;
      try {
        const translationResponse = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: `Translate the following image generation prompt to English. If it is already in English, just return it as is. Do not add any conversational text, explanations, or quotes. Just the translated prompt.\n\nPrompt: ${prompt}`,
        });
        if (translationResponse.text) {
          translatedPrompt = translationResponse.text.trim();
        }
      } catch (translateErr) {
        console.warn('Translation failed, falling back to original prompt', translateErr);
      }

      const fullPrompt = `${translatedPrompt}, ${STYLE_PROMPTS[style]}${includePerson ? ', ' + PERSON_PROMPTS[style] : ''}`;

      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-001',
        prompt: fullPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1'
        }
      });

      let base64Image = null;
      
      if (response.generatedImages && response.generatedImages.length > 0) {
        const imageBytes = response.generatedImages[0].image.imageBytes;
        if (imageBytes) {
          base64Image = `data:image/png;base64,${imageBytes}`;
        }
      }

      if (base64Image) {
        setResultImage(base64Image);
        
        // Convert to SVG in background
        try {
          const svg = await convertImageToSVG(base64Image);
          setResultSvg(svg);
        } catch (svgErr) {
          console.error('Failed to convert to SVG:', svgErr);
        }
      } else {
        throw new Error('No image returned from the API.');
      }

    } catch (err: any) {
      console.error('Generation error:', err);
      
      // Handle "Requested entity was not found" error
      if (err?.message?.includes('Requested entity was not found')) {
        setError('API 키 세션이 만료되었거나 유효하지 않습니다. 페이지를 새로고침하여 다시 선택해주세요.');
      } else {
        // Log the exact error to the screen so we can see why it fails
        setError(`이미지 생성 실패: ${err?.message || String(err)}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFile = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPNG = () => {
    if (resultImage) {
      downloadFile(resultImage, `ocare-image-${Date.now()}.png`);
    }
  };

  const handleDownloadSVG = () => {
    if (resultSvg) {
      // Convert SVG string to data URL
      const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(resultSvg)}`;
      downloadFile(svgDataUrl, `ocare-image-${Date.now()}.svg`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">O-Care Image Studio</h1>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('OCARE_GEMINI_API_KEY');
              onClearKey();
            }}
            className="text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-neutral-100"
          >
            API 키 변경
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
              <h2 className="text-lg font-medium mb-4">이미지 설정</h2>
              
              {/* Prompt Input */}
              <div className="mb-6">
                <label htmlFor="prompt" className="block text-sm font-medium text-neutral-700 mb-2">
                  프롬프트
                </label>
                <textarea
                  id="prompt"
                  rows={4}
                  className="w-full rounded-xl border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="어떤 이미지가 필요하신가요? (예: 청진기를 들고 웃고 있는 의사)"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                />
                
                {/* Feature Chips */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setIncludePerson(!includePerson)}
                    disabled={isGenerating}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                      includePerson 
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-800' 
                        : 'bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <User size={14} className="mr-1.5" />
                    사람
                  </button>
                </div>
              </div>

              {/* Style Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  스타일 선택
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label 
                    className={`relative flex flex-col items-center p-4 cursor-pointer rounded-xl border-2 transition-all ${
                      style === 'health-letter' 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-neutral-200 hover:border-emerald-200 hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="style"
                      value="health-letter"
                      checked={style === 'health-letter'}
                      onChange={() => setStyle('health-letter')}
                      className="sr-only"
                      disabled={isGenerating}
                    />
                    <FileImage className={`mb-2 ${style === 'health-letter' ? 'text-emerald-600' : 'text-neutral-400'}`} size={24} />
                    <span className={`text-sm font-medium ${style === 'health-letter' ? 'text-emerald-900' : 'text-neutral-600'}`}>
                      건강레터
                    </span>
                  </label>
                  
                  <label 
                    className={`relative flex flex-col items-center p-4 cursor-pointer rounded-xl border-2 transition-all ${
                      style === 'ocare-character' 
                        ? 'border-emerald-500 bg-emerald-50' 
                        : 'border-neutral-200 hover:border-emerald-200 hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="style"
                      value="ocare-character"
                      checked={style === 'ocare-character'}
                      onChange={() => setStyle('ocare-character')}
                      className="sr-only"
                      disabled={isGenerating}
                    />
                    <Sparkles className={`mb-2 ${style === 'ocare-character' ? 'text-emerald-600' : 'text-neutral-400'}`} size={24} />
                    <span className={`text-sm font-medium ${style === 'ocare-character' ? 'text-emerald-900' : 'text-neutral-600'}`}>
                      오케어 캐릭터
                    </span>
                  </label>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3.5 px-4 rounded-xl transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon size={20} className="mr-2" />
                    이미지 생성
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">결과 미리보기</h2>
                {resultImage && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadPNG}
                      className="inline-flex items-center px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-lg transition-colors"
                    >
                      <Download size={16} className="mr-1.5" />
                      PNG
                    </button>
                    <button
                      onClick={handleDownloadSVG}
                      disabled={!resultSvg}
                      className="inline-flex items-center px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={!resultSvg ? "SVG 변환 중..." : "SVG 다운로드"}
                    >
                      <FileCode2 size={16} className="mr-1.5" />
                      SVG
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex-1 bg-neutral-100 rounded-xl border border-neutral-200 flex items-center justify-center overflow-hidden min-h-[400px] relative">
                {isGenerating ? (
                  <div className="flex flex-col items-center text-neutral-500">
                    <Loader2 size={40} className="animate-spin mb-4 text-emerald-500" />
                    <p className="font-medium">AI가 이미지를 그리고 있습니다...</p>
                    <p className="text-sm mt-2 opacity-70">약 10~20초 정도 소요될 수 있습니다.</p>
                  </div>
                ) : resultImage ? (
                  <img 
                    src={resultImage} 
                    alt="Generated result" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center text-neutral-400">
                    <ImageIcon size={48} className="mb-3 opacity-50" />
                    <p>프롬프트를 입력하고 이미지를 생성해보세요.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
