import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Keyboard tabs
      keyboard_letters: 'Letters',
      keyboard_numbers: 'Numbers',
      keyboard_arabic: 'Arabic',
      keyboard_special: 'Special',

      // Control keys
      control_keys: 'Control',
      interrupt: 'Interrupt Process',
      cut: 'Cut',
      paste: 'Paste',
      undo: 'Undo',
      eof: 'End of File',
      clear: 'Clear Screen',

      // Directions
      up: 'Up',
      down: 'Down',
      left: 'Left',
      right: 'Right',
      space: 'Space',

      // Toolbar
      increase_font: 'Increase Font Size',
      decrease_font: 'Decrease Font Size',
      clear_terminal: 'Clear Terminal',
      toggle_keyboard: 'Toggle Virtual Keyboard',
      fullscreen: 'Toggle Fullscreen',
      connection_info: 'Connection Info',
      android_keyboard: 'Use Android Keyboard',

      // Status
      connected: 'Connected',
      disconnected: 'Disconnected',
      connecting: 'Connecting',
      error: 'Error',
      retry: 'Retry',
      try_again: 'Try Again',
      connecting_to_server: 'Connecting to server...',
      clear_error: 'Clear Error',

      // Log
      start_log: 'Start Logging',
      stop_log: 'Stop Logging',
      download_log: 'Download Log',

      // Auth
      reauth: 'Re-authenticate',
      replay_credentials: 'Replay Credentials',

      // Options
      options: 'Options'
    }
  },
  ar: {
    translation: {
      // Keyboard tabs
      keyboard_letters: 'حروف',
      keyboard_numbers: 'أرقام',
      keyboard_arabic: 'عربي',
      keyboard_special: 'خاص',

      // Control keys
      control_keys: 'تحكم',
      interrupt: 'إنهاء العملية',
      cut: 'قص',
      paste: 'لصق',
      undo: 'تراجع',
      eof: 'نهاية الملف',
      clear: 'مسح الشاشة',

      // Directions
      up: 'أعلى',
      down: 'أسفل',
      left: 'يسار',
      right: 'يمين',
      space: 'مسافة',

      // Toolbar
      increase_font: 'تكبير الخط',
      decrease_font: 'تصغير الخط',
      clear_terminal: 'مسح الطرفية',
      toggle_keyboard: 'إظهار/إخفاء لوحة المفاتيح',
      fullscreen: 'ملء الشاشة',
      connection_info: 'معلومات الاتصال',
      android_keyboard: 'استخدام لوحة مفاتيح أندرويد',

      // Status
      connected: 'متصل',
      disconnected: 'منقطع',
      connecting: 'يتصل',
      error: 'خطأ',
      retry: 'إعادة المحاولة',
      try_again: 'حاول مرة أخرى',
      connecting_to_server: 'الاتصال بالخادم...',
      clear_error: 'مسح الخطأ',

      // Log
      start_log: 'بدء التسجيل',
      stop_log: 'إيقاف التسجيل',
      download_log: 'تحميل السجل',

      // Auth
      reauth: 'إعادة المصادقة',
      replay_credentials: 'إعادة بيانات الاعتماد',

      // Options
      options: 'خيارات'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
  });

export default i18n;