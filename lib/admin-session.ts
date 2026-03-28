type AdminSession = {
  exp: number
  role: "admin"
}

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14
export const ADMIN_SESSION_COOKIE = "gay_solomon_admin_session"

function getAdminPassword() {
  const password = process.env.ADMIN_PASSWORD

  if (!password) {
    throw new Error("Missing admin password")
  }

  return password
}

function stringToBytes(value: string) {
  return new TextEncoder().encode(value)
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = ""

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "")
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=")
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    stringToBytes(getAdminPassword()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  )

  const signature = await crypto.subtle.sign("HMAC", key, stringToBytes(value))
  return bytesToBase64Url(new Uint8Array(signature))
}

export async function verifyAdminPassword(password: string) {
  return password === getAdminPassword()
}

export async function createAdminSessionToken() {
  const payload: AdminSession = {
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    role: "admin",
  }
  const encodedPayload = bytesToBase64Url(stringToBytes(JSON.stringify(payload)))
  const signature = await sign(encodedPayload)
  return `${encodedPayload}.${signature}`
}

export async function verifyAdminSessionToken(token: string) {
  const [encodedPayload, signature] = token.split(".")

  if (!encodedPayload || !signature) {
    return false
  }

  const expectedSignature = await sign(encodedPayload)

  if (expectedSignature !== signature) {
    return false
  }

  const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(encodedPayload))) as AdminSession
  return payload.role === "admin" && payload.exp > Math.floor(Date.now() / 1000)
}
