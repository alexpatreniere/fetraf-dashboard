const BACKEND = process.env.BACKEND_TARGET!;
async function proxy(req: Request, { params }: { params: { path: string[] } }) {
  const url = new URL(req.url);
  const suffix = params.path?.join("/") || "";
  const target = \\/auth/\\\;
  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", url.host);
  const res = await fetch(target, {
    method: req.method,
    headers,
    body: ["GET","HEAD"].includes(req.method) ? undefined : await req.arrayBuffer(),
    redirect: "manual",
  });
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: res.headers });
}
export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE, proxy as OPTIONS, proxy as HEAD };