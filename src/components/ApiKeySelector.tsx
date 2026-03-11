import React, { useState, useEffect } from 'react';
import { KeyRound, ExternalLink } from 'lucide-react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export function ApiKeySelector({ onKeySelected }: ApiKeySelectorProps) {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
          onKeySelected();
        }
      } catch (error) {
        console.error("Error checking API key:", error);
      } finally {
        setIsChecking(false);
      }
    };
    checkKey();
  }, [onKeySelected]);

  const handleSelectKey = async () => {
    try {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
        // Assume success to mitigate race condition
        onKeySelected();
      } else {
        console.warn("window.aistudio is not available.");
      }
    } catch (error) {
      console.error("Error opening key selector:", error);
    }
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-neutral-200 rounded-full mb-4"></div>
          <div className="h-4 w-24 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 text-center">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <KeyRound size={32} />
        </div>
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
          API Key Required
        </h1>
        <p className="text-neutral-600 mb-6">
          To generate high-quality images with Gemini 3.1 Flash Image, you need to select a paid Google Cloud API key.
        </p>
        
        <button
          onClick={handleSelectKey}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-colors mb-4"
        >
          Select API Key
        </button>
        
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          View billing documentation
          <ExternalLink size={14} className="ml-1" />
        </a>
      </div>
    </div>
  );
}
