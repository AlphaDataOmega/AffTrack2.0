import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            properties: {
              select: {
                id: true,
                name: true,
                domain: true
              }
            }
          }
        })

        if (!user) {
          throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
          isMaster: user.isMaster,
          timezone: user.timezone,
          properties: user.properties
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // Get latest user data including properties
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: {
            properties: {
              select: {
                id: true,
                name: true,
                domain: true
              }
            }
          }
        })

        // Update session with latest data
        session.user.id = token.id as string
        session.user.status = user?.status || token.status as string
        session.user.isMaster = user?.isMaster || token.isMaster as boolean
        session.user.name = user?.name || token.name as string
        session.user.timezone = user?.timezone || token.timezone as string
        session.user.properties = user?.properties || []
      }
      return session
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.status = user.status || 'active'
        token.isMaster = user.isMaster || false
        token.name = user.name || ''
        token.timezone = user.timezone || 'UTC'
        token.properties = user.properties || []
      }
      
      // Handle session updates
      if (trigger === "update" && session?.user) {
        // Only update fields that are present in the session
        if (session.user.name) token.name = session.user.name
        if (session.user.timezone) token.timezone = session.user.timezone
        if (session.user.status) token.status = session.user.status
        if (session.user.properties) token.properties = session.user.properties
      }

      return token
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  secret: process.env.NEXTAUTH_SECRET
} 