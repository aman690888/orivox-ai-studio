import React from 'react';
import { LayoutProps } from './types';
import { spacing } from '../design-system';

export const SplitLayout: React.FC<LayoutProps> = ({ header, left, right, footer }) => {
  // Density: calculate number of items in left and right
  const leftItems = React.Children.count(left);
  const rightItems = React.Children.count(right);
  const totalItems = leftItems + rightItems;
  
  // Make layout spacing dynamic based on density of items
  const dynamicGap = totalItems <= 2 ? spacing[16] : totalItems <= 4 ? spacing[12] : spacing[8];
  
  // Asymmetric split (e.g. 1/3 and 2/3) instead of just 50/50.
  // Default to an aesthetically pleasing asymmetric split (like 40/60) when media is present.
  let leftFlex = 0.4;
  let rightFlex = 0.6;
  
  if (leftItems === 1 && rightItems > 1) {
    leftFlex = 0.4;
    rightFlex = 0.6;
  } else if (rightItems === 1 && leftItems > 1) {
    leftFlex = 0.6;
    rightFlex = 0.4;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      {header && <header style={{ marginBottom: spacing[8] }}>{header}</header>}
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, gap: dynamicGap, alignItems: 'center' }}>
        <div style={{ flex: leftFlex, display: 'flex', flexDirection: 'column', gap: spacing[6] }}>{left}</div>
        <div style={{ flex: rightFlex, display: 'flex', flexDirection: 'column', gap: spacing[6] }}>{right}</div>
      </div>
      {footer && <footer style={{ marginTop: spacing[8] }}>{footer}</footer>}
    </div>
  );
};
