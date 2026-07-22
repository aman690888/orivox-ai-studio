import React from 'react';

export interface LayoutProps {
  header?: React.ReactNode;
  body?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  footer?: React.ReactNode;
  media?: React.ReactNode;
}
