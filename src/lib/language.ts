const SETTINGS_STORAGE_KEY = 'bulgarian-calendar-app-settings';

export function getCurrentLanguage(): 'bg' | 'en' {
  if (typeof window === 'undefined') return 'bg';

  try {
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings) as { language?: string };
      if (parsed.language?.toLowerCase().startsWith('en')) return 'en';
      if (parsed.language?.toLowerCase().startsWith('bg')) return 'bg';
    }

    const i18nextLng = localStorage.getItem('i18nextLng');
    if (i18nextLng?.toLowerCase().startsWith('en')) return 'en';
    if (i18nextLng?.toLowerCase().startsWith('bg')) return 'bg';
  } catch {
    // Fallback to default language below.
  }

  return 'bg';
}
