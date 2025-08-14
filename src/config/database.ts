import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"
dotenv.config()
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required")
}

if (!supabaseUrl.startsWith("https://") || supabaseUrl.includes("postgresql://")) {
  throw new Error(
    "SUPABASE_URL must be the Supabase API URL (https://your-project.supabase.co), not the PostgreSQL connection string",
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
  db: {
    schema: "public",
  },
})

export default supabase
