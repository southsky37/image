/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ImageStudio } from './components/ImageStudio';
import { ApiKeySelector } from './components/ApiKeySelector';

export default function App() {
  const [apiKeySelected, setApiKeySelected] = useState(false);

  if (!apiKeySelected) {
    return <ApiKeySelector onKeySelected={() => setApiKeySelected(true)} />;
  }

  return <ImageStudio />;
}
