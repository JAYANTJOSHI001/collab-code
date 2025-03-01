"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { theme } from '@/styles/theme';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const typeConfig = {
  success: {
    icon: FaCheckCircle,
    color: theme.colors.success.DEFAULT,
    bg: theme.colors.success.light + '20',
  },
  error: {
    icon: FaExclamationCircle,
    color: theme.colors.error.DEFAULT,
    bg: theme.colors.error.light + '20',
  },
  info: {
    icon: FaInfoCircle,
    color: theme.colors.primary[500],
    bg: theme.colors.primary[200] + '20',
  },
  warning: {
    icon: FaExclamationCircle,
    color: theme.colors.warning.DEFAULT,
    bg: theme.colors.warning.light + '20',
  },
};

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalRoot(document.body);
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!portalRoot || !isVisible) return null;

  const Icon = typeConfig[type].icon;

  return createPortal(
    <div
      className={`fixed top-4 right-4 flex items-center gap-3 p-4 rounded-lg shadow-lg transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{
        backgroundColor: typeConfig[type].bg,
        border: `1px solid ${typeConfig[type].color}`,
        zIndex: theme.zIndices.toast,
      }}
      role="alert"
    >
      <Icon className="text-xl" style={{ color: typeConfig[type].color }} />
      <p className="text-sm font-medium text-gray-900">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className="ml-4 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <FaTimes />
      </button>
    </div>,
    portalRoot
  );
}

let toastId = 0;
const toasts: { id: number; element: React.ReactNode }[] = [];

export function showToast(props: ToastProps) {
  const id = toastId++;
  const handleClose = () => {
    const index = toasts.findIndex((toast) => toast.id === id);
    if (index !== -1) {
      toasts.splice(index, 1);
      props.onClose?.();
    }
  };

  const toast = <Toast key={id} {...props} onClose={handleClose} />;
  toasts.push({ id, element: toast });

  return id;
} 