import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useWebTheme() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    document.documentElement.style.colorScheme = 'dark';
    document.body.style.backgroundColor = '#030712';
    document.body.style.color = '#f9fafb';
    document.body.style.margin = '0';
  }, []);
}
