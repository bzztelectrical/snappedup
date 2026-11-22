// Permanent redirect www.snappedupdeals.co.uk → snappedupdeals.co.uk (same path and query).
// Added 22 Nov 2026: Web Analytics showed visits split across both hosts with no redirect.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === "www.snappedupdeals.co.uk") {
    url.hostname = "snappedupdeals.co.uk";
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
