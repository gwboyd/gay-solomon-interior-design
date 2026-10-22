const assert = require("node:assert/strict")
const { readFileSync } = require("node:fs")
const path = require("node:path")
const { test } = require("node:test")
const vm = require("node:vm")
const { webcrypto } = require("node:crypto")
const ts = require("typescript")

const root = path.resolve(__dirname, "..")
const syntheticPassword = "test-only-admin-password"

// Evaluate the real TypeScript with an isolated environment and explicit mocks.
// No application dependencies, environment files, network clients or uploads run.
function loadSource(relativePath, imports) {
  const filename = path.join(root, relativePath)
  const compiled = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  const module = { exports: {} }
  const context = vm.createContext({
    module,
    exports: module.exports,
    require(name) {
      if (!Object.hasOwn(imports, name)) throw new Error(`Unexpected import: ${name}`)
      return imports[name]
    },
    process: { env: { ADMIN_PASSWORD: syntheticPassword } },
    crypto: webcrypto,
    TextEncoder,
    TextDecoder,
    btoa,
    atob,
    console: { error() {} },
  })
  new vm.Script(compiled, { filename }).runInContext(context)
  return module.exports
}

const session = loadSource("lib/admin-session.ts", {})

async function signEncoded(encodedPayload) {
  const key = await webcrypto.subtle.importKey(
    "raw", new TextEncoder().encode(syntheticPassword),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  )
  const signature = await webcrypto.subtle.sign("HMAC", key, new TextEncoder().encode(encodedPayload))
  return `${encodedPayload}.${Buffer.from(signature).toString("base64url")}`
}

function signPayload(payload) {
  return signEncoded(Buffer.from(JSON.stringify(payload)).toString("base64url"))
}

function harness(token) {
  const effects = []
  const guard = loadSource("lib/require-admin.ts", {
    "next/headers": { cookies: async () => ({ get: () => token ? { value: token } : undefined }) },
    "@/lib/admin-session": session,
  })
  const imports = {
    "@/lib/require-admin": guard,
    "@/lib/supabase": {
      createServerSupabaseClient() {
        effects.push("database client")
        return {
          from(table) {
            effects.push(`database query: ${table}`)
            let single = false
            const query = new Proxy({}, {
              get(_, method) {
                if (method === "then") {
                  const result = {
                    data: single ? { id: 1, project_id: 1, display_order: 1 } : [],
                    error: null,
                  }
                  return Promise.resolve(result).then.bind(Promise.resolve(result))
                }
                return () => {
                  if (method === "single") single = true
                  return query
                }
              },
            })
            return query
          },
        }
      },
    },
    "next/cache": { revalidatePath() { effects.push("revalidate") } },
    "@vercel/blob": {
      async put() {
        effects.push("blob upload")
        return { url: "https://example.invalid/synthetic-image" }
      },
    },
  }
  return {
    effects,
    guard,
    message: loadSource("app/actions/message.ts", imports),
    project: loadSource("app/actions/project.ts", imports),
  }
}

const privateActions = [
  ["message", "getMessages", []],
  ["message", "markMessageAsRead", [1]],
  ["message", "deleteMessage", [1]],
  ["project", "createProject", [{ name: "Synthetic project" }]],
  ["project", "updateProject", [{ id: 1, name: "Synthetic project" }]],
  ["project", "deleteProject", [1]],
  ["project", "updateProjectOrder", [1, "up"]],
  ["project", "createProjectImage", [{ project_id: 1 }, { name: "synthetic.png" }]],
  ["project", "updateProjectImage", [{ id: 1 }, { name: "synthetic.png" }]],
  ["project", "deleteProjectImage", [1]],
  ["project", "updateProjectImageOrder", [1, "up"]],
  ["project", "updateHomepageSettings", [{ hero_image_id: 1 }]],
]

test("private actions reject non-admin sessions before every side effect", async t => {
  const valid = await session.createAdminSessionToken()
  const future = Math.floor(Date.now() / 1000) + 3600
  const cases = [
    ["missing", undefined],
    ["invalid signature", valid.slice(0, -1) + (valid.endsWith("A") ? "B" : "A")],
    ["expired", await signPayload({ role: "admin", exp: 1 })],
    ["non-admin", await signPayload({ role: "user", exp: future })],
    ["malformed", "not-a-session"],
    ["malformed signed payload", await signEncoded(Buffer.from("not json").toString("base64url"))],
    ["extra segment", `${valid}.extra`],
    ["invalid expiration type", await signPayload({ role: "admin", exp: String(future) })],
  ]
  for (const [description, token] of cases) {
    await t.test(description, async () => {
      const h = harness(token)
      await assert.rejects(h.guard.requireAdminSession(), /Unauthorized/)
      for (const [group, name, args] of privateActions) {
        await assert.rejects(h[group][name](...args), /Unauthorized/, name)
      }
      assert.deepEqual(h.effects, [])
    })
  }
})

test("valid admin sessions permit all private actions", async t => {
  const token = await session.createAdminSessionToken()
  for (const [group, name, args] of privateActions) {
    await t.test(name, async () => {
      const h = harness(token)
      await h.guard.requireAdminSession()
      const result = await h[group][name](...args)
      if (name === "getMessages") assert.equal(result.length, 0)
      else assert.equal(result.success, true)
      assert.ok(h.effects.includes("database client"))
      if (name === "createProjectImage" || name === "updateProjectImage") {
        assert.ok(h.effects.includes("blob upload"))
      }
    })
  }
})

test("public contact submission and portfolio reads require no admin cookie", async () => {
  const h = harness(undefined)
  const result = await h.message.createMessage({
    name: "Synthetic visitor", email: "visitor@example.invalid", message: "Synthetic inquiry",
  })
  assert.equal(result.success, true)
  for (const [name, args] of [
    ["getProjects", []], ["getProjectsWithImages", []],
    ["getProject", [1]], ["getProjectWithImages", [1]],
    ["getProjectImages", []], ["getProjectImage", [1]], ["getHomepageSettings", []],
  ]) {
    await h.project[name](...args)
  }
  assert.ok(h.effects.includes("database query: messages"))
  assert.ok(h.effects.includes("database query: projects"))
  assert.ok(!h.effects.includes("blob upload"))
})
