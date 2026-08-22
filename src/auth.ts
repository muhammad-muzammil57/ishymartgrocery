import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectDb from "./app/lib/db"
import User from "./app/Models/user.model"
import Otp from "./app/Models/otp.model"
import Google from "next-auth/providers/google"
import { sendLoginNotificationEmail } from "./app/lib/mailer"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // Credentials provider ab OTP verify karta hai (password nahi)
      // Login flow: email + password → send-login-otp API → yahan otp verify
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string
        const otp = credentials?.otp as string

        if (!email || !otp) {
          throw new Error("Please enter both email and otp!")
        }
        await connectDb()
        
        // Pehli baar register ke baad auto login
        if (otp === "first_time_register") {
          const user = await User.findOne({ email })
          if (!user) throw new Error("User Not Found!")
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            image: user.image,
          }
        }
        
        const otpRecord = await Otp.findOne({ email, type: "login" })

        if (!otpRecord) {
          throw new Error("OTP not found. Please login again.")
        }

        if (new Date() > otpRecord.expiresAt) {
          await Otp.deleteOne({ _id: otpRecord._id })
          throw new Error("OTP has been expired. Please try again.")
        }

        if (otpRecord.otp !== otp.trim()) {
          throw new Error("Wrong OTP!")
        }

        // OTP sahi hai — delete karo aur user return karo
        await Otp.deleteOne({ _id: otpRecord._id })

        const user = await User.findOne({ email })
        if (!user) {
          throw new Error("User Not Found!")
        }

         // Login notification email — async (user ko wait na karwao)
         sendLoginNotificationEmail(email, user.name).catch((err) =>
          console.error("Login notification email error:", err)
        )

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectDb()
        let dbUser = await User.findOne({ email: user.email })
        if (!dbUser) {
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image ?? undefined,
          })
          sendWelcomeEmailForGoogle(user.email!, user.name!).catch(console.error)
        }else {
          // ← Yeh nayi line add karein — purana user ho toh image update karo
          await User.findOneAndUpdate(
            { email: user.email },
            { image: user.image }
          )
          sendLoginNotificationEmail(user.email!, dbUser.name).catch(console.error)
        }
        user.id = dbUser._id.toString()
        user.role = dbUser.role
      }
      return true
    },

    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.role = user.role
        token.image = user.image
      }
      if (trigger === "update") {
        token.role = session.role
      }
      return token
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.role = token.role as string
        session.user.image = token.image as string
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60, // 10 din (seconds mein, milliseconds nahi)
  },

  secret: process.env.AUTH_SECRET,
})

async function sendWelcomeEmailForGoogle(email: string, name: string) {
  const { sendWelcomeEmail } = await import("./app/lib/mailer")
  await sendWelcomeEmail(email, name)
}