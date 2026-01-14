import { processBMIByUser } from "../services/bmi.service.js";

export const getBMIByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        status: false,
        status_code: 401,
        message: "Authorization token required"
      });
    }

    const data = await processBMIByUser(userId, token);

    return res.status(200).json({
      status: true,
      status_code: 200,
      data
    });
  } catch (err) {
    return res.status(400).json({
      status: false,
      status_code: 400,
      message: err.message
    });
  }
};
