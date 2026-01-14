const axios = require('axios');

const getUserHeightWeight = async (userId, token) => {
  const response = await axios.get(
    `https://test.onboardserv.emedihub.com/user/profile-details?userId=${userId}`,
    {
      headers: {
        Authorization: token   // 🔑 This IS required
      },
      timeout: 5000
    }
  );

  const data = response.data?.data;

  if (!data?.height || !data?.weight) {
    throw new Error('Height or weight not available');
  }

  return {
    height: Number(data.height),
    weight: Number(data.weight)
  };
};

module.exports = {
  getUserHeightWeight
};
