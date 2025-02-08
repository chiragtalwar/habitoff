export const dateUtils = {
  /**
   * Get today's date at midnight in user's local timezone
   */
  getToday(): Date {
    const now = new Date();
    // Create date string in local timezone
    const localDateString = now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0');
    const local = new Date(localDateString + 'T00:00:00');
    local.setFullYear(2025);
    return local;
  },

  /**
   * Normalize any date to midnight in user's local timezone
   */
  normalizeDate(date: Date | string): Date {
    const d = new Date(date);
    // Create date string in local timezone
    const localDateString = d.getFullYear() + '-' + 
      String(d.getMonth() + 1).padStart(2, '0') + '-' + 
      String(d.getDate()).padStart(2, '0');
    const local = new Date(localDateString + 'T00:00:00');
    local.setFullYear(2025);
    return local;
  },

  /**
   * Format a date to YYYY-MM-DD in user's local timezone
   */
  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.getFullYear() + '-' + 
      String(d.getMonth() + 1).padStart(2, '0') + '-' + 
      String(d.getDate()).padStart(2, '0');
  },

  /**
   * Get the date range for the current week (Monday to Sunday)
   */
  getCurrentWeekRange() {
    const today = this.getToday();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { monday, sunday };
  },

  /**
   * Check if a date is in the current week
   */
  isInCurrentWeek(date: Date | string): boolean {
    const { monday, sunday } = this.getCurrentWeekRange();
    const checkDate = this.normalizeDate(date);
    return checkDate >= monday && checkDate <= sunday;
  },

  /**
   * Check if a date is in the past (before today)
   */
  isPastDate(date: Date | string): boolean {
    const today = this.getToday();
    const checkDate = this.normalizeDate(date);
    return checkDate < today;
  },

  /**
   * Get dates for the current week
   */
  getCurrentWeekDates(): Date[] {
    const { monday } = this.getCurrentWeekRange();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date;
    });
  },

  /**
   * Check if two dates are the same day
   */
  isSameDay(date1: Date | string, date2: Date | string): boolean {
    const d1 = this.normalizeDate(date1);
    const d2 = this.normalizeDate(date2);
    return d1.getTime() === d2.getTime();
  },

  /**
   * Convert UTC ISO string to local date string
   */
  utcToLocal(utcDate: string): string {
    const date = new Date(utcDate);
    const localDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    return this.formatDate(localDate);
  },

  /**
   * Convert local date to UTC ISO string for storage
   */
  localToUTC(localDate: string | Date): string {
    const date = new Date(localDate);
    // Adjust the date to UTC midnight
    const utcDate = new Date(Date.UTC(
      2025,
      date.getMonth(),
      date.getDate(),
      0, 0, 0
    ));
    return utcDate.toISOString();
  }
}; 