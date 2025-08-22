"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function AuthButton() {
  const { status, data } = useSession();
  if (status === "loading") return null;
  if (status === "authenticated") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">{data.user?.name}</span>
        <button className="text-sm underline" onClick={() => signOut()}>
          Sign out
        </button>
      </div>
    );
  }
  return (
    <button className="text-sm underline" onClick={() => signIn("github")}>
      Sign in
    </button>
  );
}
