const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Normalize token
    req.user = {
      userId: decoded.id,                 // numeric ID
      role: decoded.type.toUpperCase(),   // doctor → DOCTOR
      phone: decoded.phone
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

exports.requireRole = roles => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};
