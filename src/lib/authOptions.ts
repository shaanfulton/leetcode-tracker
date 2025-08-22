import type { NextAuthOptions, Session, User } from "next-auth";
import GitHub from "next-auth/providers/github";
import { pool } from "@/lib/db";
import type { JWT } from "next-auth/jwt";

type TokenWithDbId = JWT & { dbUserId?: number };
type SessionWithDbId = Session & { dbUserId?: number };

export const authOptions: NextAuthOptions = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false;
      const provider = account.provider;
      const providerAccountId =
        // Some providers expose providerAccountId; others expose userId
        (account as unknown as { providerAccountId?: string; userId?: string })
          .providerAccountId ||
        (account as unknown as { userId?: string }).userId ||
        "";
      if (!provider || !providerAccountId) return false;
      const name = user.name || null;
      const email = user.email || null;
      const image = user.image || null;
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const res = await client.query<{ id: number }>(
          `INSERT INTO users (provider, provider_account_id, name, email, image)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (provider, provider_account_id)
           DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, image = EXCLUDED.image
           RETURNING id`,
          [provider, providerAccountId, name, email, image]
        );
        const dbUserId = res.rows[0]?.id;
        await client.query("COMMIT");
        (user as User & { dbUserId?: number }).dbUserId = dbUserId;
        return true;
      } catch {
        await client.query("ROLLBACK");
        return false;
      } finally {
        client.release();
      }
    },
    async jwt({ token, user }) {
      if (user && (user as User & { dbUserId?: number }).dbUserId) {
        (token as TokenWithDbId).dbUserId = (
          user as User & { dbUserId?: number }
        ).dbUserId;
      }
      return token;
    },
    async session({ session, token }) {
      const dbUserId = (token as TokenWithDbId).dbUserId;
      const s = session as SessionWithDbId;
      if (dbUserId) s.dbUserId = dbUserId;
      return s;
    },
  },
};
