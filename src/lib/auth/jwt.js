
import { verifyAccessToken} from "./tools.js";


export const JWTAuthMiddleware= async (req, res, next) => {
  // 1. Check if authorization header is in the request, if it is not --> 401
  if (!req.headers.authorization) {
    next(
      { status: 401, message: "Invalid token" }
    );
  } else {
    // 2. If authorization header is there, we should extract the token out of it
    // Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDJkMzhhN2ZhN2JlYTgxYmYyZGU2NDgiLCJyb2xlIjoiVXNlciIsImlhdCI6MTY4MDY4NTQ0NiwiZXhwIjoxNjgxMjkwMjQ2fQ.V9rVYh0BrOOwvqeI2YdeCBwEZL4RlEOrQoQ9Mv0Z3Mo"
    const accessToken = req.headers.authorization.replace("Bearer ", "");
    try {
      // 3. Verify the token (check the integrity and check expiration date)
      const payload = await verifyAccessToken(accessToken);
      // 4. If everything is fine we should get back the payload and no errors should be thrown --> next
      req.user = {
        _id: payload._id,
        role: payload.role,
      };

      next();

      // 5. If the token is NOT ok for any reason, or in any case jsonwebtoken will throw any error --> 401
    } catch (error) {
      console.log(error);
      next({ status: 401, message: "Invalid token" });
    }
  }
};
