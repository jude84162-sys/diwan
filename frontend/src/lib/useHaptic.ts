// Haptic Feedback للتجربة اللمسية
export function haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') {
  if (!('vibrate' in navigator)) return

  const patterns: Record<string, number | number[]> = {
    light: 10,
    medium: 20,
    heavy: 40,
    success: [10, 30, 10],
    error: [50, 30, 50],
  }

  try {
    navigator.vibrate(patterns[type])
  } catch {
    // تجاهل الأخطاء
  }
}

export function useHaptic() {
  return haptic
}
