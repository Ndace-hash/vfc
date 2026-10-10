// Every route under /api/admin/ requires a signed-in admin
export default defineEventHandler(async (event) => {
	if (!event.path.startsWith("/api/admin/")) return;
	event.context.admin = await requireAdmin(event);
});
