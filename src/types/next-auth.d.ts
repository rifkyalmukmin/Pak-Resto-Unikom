import { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      foto_profil?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    foto_profil?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    foto_profil?: string | null;
  }
}
