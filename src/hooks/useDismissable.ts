import { useEffect, useRef } from 'react';

/**
 * Closes a popover on outside click or Escape.
 * The theme picker and export menu previously stayed open until you clicked the
 * trigger again, which on mobile meant they sat over the content.
 */
export function useDismissable<T extends HTMLElement>(
  isOpen: boolean,
  onDismiss: () => void,
) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const container = containerRef.current;
      if (container && !container.contains(event.target as Node)) onDismiss();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onDismiss]);

  return containerRef;
}
