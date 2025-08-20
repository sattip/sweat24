import { useEffect, useState } from 'react';

export function useKeyboardVisible() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        setKeyboardVisible(true);
        // Scroll the element into view with some offset
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    };

    const handleBlur = () => {
      setKeyboardVisible(false);
    };

    // Add event listeners
    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    // Cleanup
    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  return isKeyboardVisible;
}

// Hook to automatically handle keyboard on mobile
export function useMobileKeyboardFix() {
  const isKeyboardVisible = useKeyboardVisible();

  useEffect(() => {
    if (isKeyboardVisible) {
      document.body.classList.add('has-keyboard-open');
      // For iOS, prevent body scroll when keyboard is open
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
      }
    } else {
      document.body.classList.remove('has-keyboard-open');
      // Reset iOS fixes
      if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        document.body.style.position = '';
        document.body.style.width = '';
      }
    }

    return () => {
      document.body.classList.remove('has-keyboard-open');
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isKeyboardVisible]);

  return isKeyboardVisible;
}