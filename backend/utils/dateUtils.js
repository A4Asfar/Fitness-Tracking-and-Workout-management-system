/**
 * Shared Date and Health Utility Functions
 * Centralizes logic previously duplicated across workoutController, contentController, and profileController
 */

/**
 * Returns a consistent YYYY-MM-DD date string using local time,
 * avoiding UTC offset bugs when grouping workouts by day.
 * @param {Date|string} [d] - Date to format, defaults to now
 * @returns {string} e.g. "2026-07-07"
 */
const getLocalDateString = (d = new Date()) => {
  const dateObj = new Date(d);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculates BMI and returns the numeric value + category string.
 * Returns null values when height or weight are missing or zero.
 * @param {number} weightKg
 * @param {number} heightCm
 * @returns {{ bmi: number, bmiCategory: string }}
 */
const calculateBMI = (weightKg, heightCm) => {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) {
    return { bmi: 0, bmiCategory: 'N/A' };
  }
  const heightInMeters = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightInMeters * heightInMeters)).toFixed(1));
  let bmiCategory = 'N/A';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi < 25) bmiCategory = 'Normal';
  else if (bmi < 30) bmiCategory = 'Overweight';
  else bmiCategory = 'Obese';
  return { bmi, bmiCategory };
};

module.exports = { getLocalDateString, calculateBMI };
