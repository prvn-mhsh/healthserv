exports.calculateBMI = (heightCm, weightKg) => {
  const heightMeters = heightCm / 100;
  return Number((weightKg / (heightMeters * heightMeters)).toFixed(2));
};

exports.getBMICategory = (bmi) => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 24.9) return "Normal weight";
  if (bmi < 29.9) return "Overweight";
  return "Obese";
};
