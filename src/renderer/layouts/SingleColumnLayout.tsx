import React from 'react';
import { LayoutProps } from './types';
import { spacing } from '../design-system';

export const SingleColumnLayout: React.FC<LayoutProps> = ({ header, body, footer }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {header && <header style={{ marginBottom: spacing[8] }}>{header}</header>}
      <main style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: spacing[6], alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
          {body}
        </div>
      </main>
      {footer && <footer style={{ marginTop: spacing[8] }}>{footer}</footer>}
    </div>
  );
};
