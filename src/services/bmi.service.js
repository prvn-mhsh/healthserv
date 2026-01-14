const { getUserHeightWeight } = require('./profile.service');
const { calculateBMI, getBMICategory } = require('../utils/bmi.util');

module.exports.processBMIByUser = async (userId, token) => {
  if (!userId) throw new Error('User ID required');

  const { height, weight } = await getUserHeightWeight(userId, token);

  const bmi = calculateBMI(height, weight);
  const category = getBMICategory(bmi);

  return {
    height_cm: height,
    weight_kg: weight,
    bmi,
    category
  };
};
