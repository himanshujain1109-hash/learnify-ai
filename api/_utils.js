// FRONTEND_URL may be a single URL or a comma-separated list (used when the
// app is deployed as Vercel serverless functions directly, bypassing
// backend/server.js's own cors() middleware). We must never write a
// comma-separated list straight into Access-Control-Allow-Origin — browsers
// only accept a single origin value there, so doing that silently breaks
// every request (including registration) whenever more than one origin is
// configured.
function resolveOrigin(req) {
  const configured = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  const requestOrigin = (req?.headers?.origin || "").replace(/\/+$/, "");

  if (configured.length === 0) return "*";
  if (requestOrigin && configured.includes(requestOrigin)) return requestOrigin;
  return configured[0];
}

export function setCors(res, req) {
  res.setHeader("Access-Control-Allow-Origin", resolveOrigin(req));
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
}

export function sendError(res, error) {
  console.error(error);
  return res.status(error.statusCode || 500).json({ message: error.message || 'Server error' });
}
