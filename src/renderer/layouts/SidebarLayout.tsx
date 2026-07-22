import React from 'react';
import { LayoutProps } from './types';
import { spacing } from '../design-system';

export const SidebarLayout: React.FC<LayoutProps> = ({ header, left, body, right, footer }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {header && <header style={{ marginBottom: spacing[8] }}>{header}</header>}
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, gap: spacing[10] }}>
        {left && <aside style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: spacing[4] }}>{left}</aside>}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: spacing[6] }}>{body}</main>
        {right && <aside style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: spacing[4] }}>{right}</aside>}
      </div>
      {footer && <footer style={{ marginTop: spacing[8] }}>{footer}</footer>}
    </div>
  );
};
