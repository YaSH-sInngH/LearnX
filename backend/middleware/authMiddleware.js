import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {

  if (req.method === 'GET' && req.originalUrl.startsWith('/api/profile/')) {
    return next();
  }

  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }
    next();
  };
};