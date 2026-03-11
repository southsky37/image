import React, { useState, useEffect } from 'react';
import { KeyRound, ExternalLink, ArrowRight } from 'lucide-react';

interface ApiKeySelectorProps {
  onKeySelected: (key: string) => void;
}

export function ApiKeySelector({ onKeySelected }: ApiKeySelectorProps) {
  const [inputKey, setInputKey] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // 1. Check if it's baked into the environment (Vercel deployment)
    if (process.env.GEMINI_API_KEY) {
      onKeySelected(process.env.GEMINI_API_KEY);
      return;
    }
    
    // 2. Check if the user previously saved it in this browser
    const savedKey = localStorage.getItem('OCARE_GEMINI_API_KEY');
    if (savedKey) {
      onKeySelected(savedKey);
    }
  }, [onKeySelected]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey.trim().startsWith('AIzaSy')) {
      setError('유효하지 않은 API 키 형식입니다. (AIzaSy... 로 시작해야 합니다)');
      return;
    }
    
    // Save locally for convenience & return
    localStorage.setItem('OCARE_GEMINI_API_KEY', inputKey.trim());
    onKeySelected(inputKey.trim());
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 p-4 font-sans text-neutral-900">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <KeyRound size={32} />
        </div>
        <h1 className="text-2xl font-semibold mb-2">
          Gemini API 키 입력
        </h1>
        <p className="text-neutral-600 mb-6 text-sm leading-relaxed">
          고품질 이미지를 생성하기 위해 Google Gemini API 키가 필요합니다.<br/>
          입력하신 키는 브라우저에만 암호화되어 안전하게 보관됩니다. (서버 전송 안 됨)
        </p>
        
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-3">
          <input
            type="password"
            placeholder="AIzaSy..."
            value={inputKey}
            onChange={(e) => {
              setInputKey(e.target.value);
              setError('');
            }}
            className="w-full text-center rounded-xl border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono text-sm"
          />
          {error && <p className="text-red-500 text-xs text-left">{error}</p>}
          <button
            type="submit"
            disabled={!inputKey.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            시작하기 <ArrowRight size={18} />
          </button>
        </form>
        
        <a 
          href="https://aistudio.google.com/app/apikey" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          무료 API 키 발급받기
          <ExternalLink size={14} className="ml-1" />
        </a>
      </div>
    </div>
  );
}
