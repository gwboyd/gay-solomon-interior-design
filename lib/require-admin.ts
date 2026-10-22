import { cookies } from "next/headers"
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-session"

export async function requireAdminSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value

  if (!token || !(await verifyAdminSessionToken(token))) {
    throw new Error("Unauthorized")
  }
}
