import jwt from "jsonwebtoken";

export function signToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw Object.assign(
      new Error("Server misconfiguration: JWT_SECRET is not set."),
      { statusCode: 500 }
    );
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn:"7d" });
}

export function requireAuth(req) {
  const header=req.headers.authorization || "";
  const token=header.startsWith("Bearer ") ? header.slice(7) : null;
  if(!token) throw Object.assign(new Error("Authentication required"),{statusCode:401});
  try { return jwt.verify(token,process.env.JWT_SECRET); }
  catch { throw Object.assign(new Error("Invalid or expired token"),{statusCode:401}); }
}