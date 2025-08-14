import express from "express"
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import authRoutes from "./routes/authRoutes"
import { authRateLimit } from "./middleware/rateLimiter"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
)

app.use(cors({origin: process.env.ALLOWED_ORIGINS?.split(",") || false, credentials: false, methods: ["POST", "GET", "DELETE", "PUT"], allowedHeaders: ["Content-Type"], }) )

app.use(
  express.json({
    limit: "1mb",
    strict: true,
  }),
)

app.set("trust proxy", 1)
app.disable("x-powered-by")

app.use("/api/auth", authRateLimit)
app.use("/api/auth", authRoutes)

app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  })
})

app.use(( _err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  })
})

app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on ${PORT}`)
})

export default app
