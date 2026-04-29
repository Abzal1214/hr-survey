// Простое логирование ошибок для API (можно заменить на Sentry или LogRocket для продакшена)
export function logError(context, error) {
  if (process.env.NODE_ENV === 'production') {
    // Здесь можно интегрировать Sentry, LogRocket и т.д.
    // Например: Sentry.captureException(error)
  }
  // Для разработки — лог в консоль
  // eslint-disable-next-line no-console
  console.error(`[${context}]`, error);
}
