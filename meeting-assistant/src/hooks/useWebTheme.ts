import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useWebTheme() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    const html = document.documentElement;
    const body = document.body;

    html.style.colorScheme = 'dark';
    html.style.height = '100%';

    body.style.backgroundColor = '#030712';
    body.style.color = '#f9fafb';
    body.style.margin = '0';
    body.style.overflow = 'auto';
    body.style.height = 'auto';
    body.style.minHeight = '100%';
    (body.style as CSSStyleDeclaration & { webkitOverflowScrolling?: string }).webkitOverflowScrolling =
      'touch';

    const root = document.getElementById('root');
    if (root) {
      root.style.minHeight = '100vh';
      root.style.height = 'auto';
      root.style.overflow = 'visible';
    }
  }, []);
}
