const address = process.env.SMOKE_ADDRESS;
if (!address) throw new Error("SMOKE_ADDRESS is required");

const request = async (path, options = {}) => {
  const response = await fetch(`${address}${path}`, {
    ...options,
    signal: AbortSignal.timeout(5000),
  });
  return { response, body: await response.json().catch(() => undefined) };
};

const login = await request("/auth/login", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    email: "admin@example.com",
    password: "admin-password",
  }),
});
if (!login.response.ok || !login.body?.token)
  throw new Error("container login failed");
const auth = { authorization: `Bearer ${login.body.token}` };
const json = { ...auth, "content-type": "application/json" };
const organization = await request("/admin/organizations", {
  method: "POST",
  headers: json,
  body: JSON.stringify({ name: "Smoke Org" }),
});
if (organization.response.status !== 201)
  throw new Error("organization creation failed");
const workspace = await request("/admin/workspaces", {
  method: "POST",
  headers: json,
  body: JSON.stringify({ orgId: organization.body.id, name: "Smoke A" }),
});
const otherWorkspace = await request("/admin/workspaces", {
  method: "POST",
  headers: json,
  body: JSON.stringify({ orgId: organization.body.id, name: "Smoke B" }),
});
if (workspace.response.status !== 201 || otherWorkspace.response.status !== 201)
  throw new Error("workspace creation failed");
const me = await request("/me", { headers: auth });
if (me.response.status !== 200 || !me.body?.userId)
  throw new Error("authenticated identity lookup failed");
const membership = await request("/admin/memberships", {
  method: "POST",
  headers: json,
  body: JSON.stringify({
    userId: me.body?.userId,
    workspaceId: workspace.body.id,
    role: "admin",
  }),
});
if (membership.response.status !== 201)
  throw new Error("membership creation failed");
const contact = await request(`/contacts?workspaceId=${workspace.body.id}`, {
  method: "POST",
  headers: json,
  body: JSON.stringify({ name: "Smoke Contact" }),
});
if (contact.response.status !== 201) throw new Error("contact creation failed");
const read = await request(
  `/contacts/${contact.body.id}?workspaceId=${workspace.body.id}`,
  {
    headers: auth,
  },
);
if (read.response.status !== 200) throw new Error("contact read failed");
const updated = await request(
  `/contacts/${contact.body.id}?workspaceId=${workspace.body.id}`,
  {
    method: "PATCH",
    headers: json,
    body: JSON.stringify({ name: "Smoke Contact Updated" }),
  },
);
if (
  updated.response.status !== 200 ||
  updated.body?.name !== "Smoke Contact Updated"
)
  throw new Error("contact update failed");
const denied = await request(
  `/contacts/${contact.body.id}?workspaceId=${otherWorkspace.body.id}`,
  { headers: auth },
);
if (denied.response.status !== 401)
  throw new Error("cross-tenant contact access was not denied");
const deleted = await request(
  `/contacts/${contact.body.id}?workspaceId=${workspace.body.id}`,
  {
    method: "DELETE",
    headers: auth,
  },
);
if (deleted.response.status !== 204) throw new Error("contact deletion failed");
const gone = await request(
  `/contacts/${contact.body.id}?workspaceId=${workspace.body.id}`,
  {
    headers: auth,
  },
);
if (gone.response.status !== 404)
  throw new Error("deleted contact remains visible");
