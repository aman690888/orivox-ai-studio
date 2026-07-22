import React from 'react';
import { LayoutProps } from './types';
import { spacing } from '../design-system';

export const HeroLayout: React.FC<LayoutProps> = ({ header, body, media, footer }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: spacing[8] }}>
      {header && <header style={{ width: '100%', marginBottom: spacing[4] }}>{header}</header>}
      {media && <div style={{ width: '100%', margin: `${spacing[8]} 0` }}>{media}</div>}
      {body && <main style={{ display: 'flex', flexDirection: 'column', gap: spacing[4], width: '100%', maxWidth: '800px' }}>{body}</main>}
      {footer && <footer style={{ marginTop: 'auto', paddingTop: spacing[8], width: '100%' }}>{footer}</footer>}
    </div>
  );
};
