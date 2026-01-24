const jwt = require('jsonwebtoken');

const roleMap = {
  1: 'ADMIN' // Admin uses role_id
};

exports.authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Determine role
    let role = decoded.type
      ? decoded.type.toUpperCase()           // Doctor/Patient
      : decoded.role_id
      ? roleMap[decoded.role_id]             // Admin
      : null;

    if (!role) {
      return res.status(401).json({ message: 'Invalid token role' });
    }

    req.user = {
      userId: decoded.id,
      role,
      phone: decoded.phone || null
    };

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

exports.requireRole = roles => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};
