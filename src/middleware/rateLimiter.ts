import rateLimit from "express-rate-limit"

export const authRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: "Muitas tentativas de autenticação. Tente novamente em 1 minuto.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || "unknown"
  },
  skip: (req) => {
    return req.method !== "POST"
  },
})

export const adminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Muitas tentativas de criação. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || "unknown"
  },
})
