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
      type_command: 'Type your command...',
      press_enter_send: 'Press Enter to send',
      press_esc_close: 'Esc to close',
      show_keyboard: 'Show Keyboard',
      hide_keyboard: 'Hide Keyboard',
      more_options: 'More Options',
      enable_wake_lock: 'Keep Screen Awake',
      disable_wake_lock: 'Allow Screen Sleep',
      wake_lock_not_supported: 'Wake Lock is not supported on this device',

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
      options: 'Options',

      // Theme
      select_theme: 'Select Theme'
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
      type_command: 'اكتب الأمر...',
      press_enter_send: 'Enter للإرسال',
      press_esc_close: 'Esc للإغلاق',
      show_keyboard: 'إظهار لوحة المفاتيح',
      hide_keyboard: 'إخفاء لوحة المفاتيح',
      more_options: 'خيارات أكثر',
      enable_wake_lock: 'إبقاء الشاشة مضاءة',
      disable_wake_lock: 'السماح بإطفاء الشاشة',
      wake_lock_not_supported: 'خاصية إبقاء الشاشة مضاءة غير مدعومة على هذا الجهاز',

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
      options: 'خيارات',

      // Theme
      select_theme: 'اختيار النمط'
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