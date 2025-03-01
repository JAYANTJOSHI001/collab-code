"use client";

import React from 'react';
import { theme } from '@/styles/theme';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const sizeMap = {
  sm: '1rem',
  md: '2rem',
  lg: '3rem',
};

export function Spinner({ size = 'md', color = theme.colors.primary[500] }: SpinnerProps) {
  return (
    <div
      className="inline-block animate-spin"
      style={{
        width: sizeMap[size],
        height: sizeMap[size],
        borderWidth: size === 'sm' ? '2px' : '3px',
        borderStyle: 'solid',
        borderColor: `${color} transparent transparent transparent`,
        borderRadius: '50%',
      }}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
} 