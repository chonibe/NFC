'use client';

import { useEffect } from 'react';
import VerisartDashboard from '../../components/VerisartDashboard';

export default function EmbedPage() {
  useEffect(() => {
    // Verify we're embedded in the correct context
    if (window.location.href.includes('thestreetlamp.com')) {
      const verisartContent = document.querySelector('#verisart-app');
      if (!verisartContent) {
        console.error('Verisart content not found - user may not be authenticated');
      }
    }
  }, []);

  return <VerisartDashboard />;
}
