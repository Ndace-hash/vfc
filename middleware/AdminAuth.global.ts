import { useUserStore } from "~/stores/Users";
export default defineNuxtRouteMiddleware((to, from) => {
	const userStore = useUserStore();
	if (to.meta.layout == "admin" && !userStore.currentUser) {
		return navigateTo("/admin/login");
	}
});
