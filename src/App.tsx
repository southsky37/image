/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ImageStudio } from './components/ImageStudio';
import { ApiKeySelector } from './components/ApiKeySelector';

export default function App() {
  const [apiKey, setApiKey] = useState<string>('');

  if (!apiKey) {
    return <ApiKeySelector onKeySelected={(key) => setApiKey(key)} />;
  }

  return <ImageStudio apiKey={apiKey} />;
}
