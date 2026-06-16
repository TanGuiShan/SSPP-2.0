// middleware/authGuard.js
// "Middleware" is code that runs BETWEEN receiving a request
// and sending a response. This one checks: is the user logged in?
//
// How it works:
//   1. Client sends request with header:
//      Authorization: Bearer <token>
//   2. We extract and verify the token
//   3. If valid → attach user info to req.user, continue
//   4. If invalid → immediately return 401 Unauthorized

import jwt from 'jsonwebtoken'

export default function authGuard(req, res, next) {
  // Extract the token from the Authorization header
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'No token provided. Please log in.' })
  }

  try {
    // Verify the token using our secret key
    // If tampered with or expired, this throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach the decoded user info to the request
    // Route handlers can now access req.user.id, req.user.email
    req.user = decoded

    next() // move on to the actual route handler
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' })
  }
}