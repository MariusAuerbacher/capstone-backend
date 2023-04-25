import { verifyAccessToken } from "./tools.js";

export const JWTAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next({ status: 401, message: "Invalid token" });
  } else {
    const accessToken = req.headers.authorization.replace("Bearer ", "");
    try {
      const payload = await verifyAccessToken(accessToken);

      req.user = {
        _id: payload._id,
        role: payload.role,
      };

      next();
    } catch (error) {
      console.log(error);
      next({ status: 401, message: "Invalid token" });
    }
  }
};
