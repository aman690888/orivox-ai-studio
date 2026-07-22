import React from 'react';
import { LayoutProps } from './types';
import { spacing } from '../design-system';

export const GridLayout: React.FC<LayoutProps> = ({ header, body, footer }) => {
  const numItems = React.Children.count(body);
  const dynamicGap = numItems <= 4 ? spacing[16] : numItems <= 8 ? spacing[12] : spacing[8];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {header && <header style={{ marginBottom: spacing[8] }}>{header}</header>}
      <main style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: dynamicGap, 
        flex: 1 
      }}>
        {body}
      </main>
      {footer && <footer style={{ marginTop: spacing[8] }}>{footer}</footer>}
    </div>
  );
};
