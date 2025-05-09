import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth"

const handler = NextAuth({
  ...authConfig,
  debug: false,
  logger: {
    error: console.error,
    warn: console.warn,
    debug: () => {}
  }
})

export { handler as GET, handler as POST } 