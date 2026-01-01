'use client';

import { useState } from 'react';

export function useFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return {
    openIndex,
    toggleFAQ,
  };
}

