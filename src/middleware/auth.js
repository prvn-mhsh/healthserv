const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const roleMap = {
  1: 'ADMIN'
};

const client = jwksClient({
  jwksUri: process.env.JWKS_URL, // eg: http://identityserv/.well-known/jwks.json
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000, // 10 min
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

exports.authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    jwt.verify(
      token,
      getKey,
      {
        algorithms: ['RS256'],
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
      },
      (err, decoded) => {
        if (err) {
          console.error(err);
          return res.status(401).json({ message: 'Invalid token' });
        }

        // Determine role
        let role = decoded.role
        ? decoded.role.toUpperCase()
        : decoded.kind
        ? decoded.kind.toUpperCase()
        : decoded.role_id
        ? roleMap[decoded.role_id]
        : null;


        if (!role) {
          return res.status(401).json({ message: 'Invalid token role' });
        }

        req.user = {
          userId: decoded.sub,
          role,
          phone: decoded.phone || null
        };

        next();
      }
    );
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
