<template>
	<div class="min-h-screen bg-default">
		<!-- phones and tablets: a top bar whose menu button opens the sidebar as a drawer -->
		<header
			class="lg:hidden sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-default bg-default px-2 text-highlighted"
		>
			<button
				type="button"
				class="grid size-11 place-items-center rounded-lg hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
				aria-label="Open menu"
				:aria-expanded="mobileOpen"
				@click="mobileOpen = true"
			>
				<UIcon name="i-bi-list" class="size-6" />
			</button>
			<img src="/valiant.png" alt="" class="size-8" />
			<span class="font-semibold">Valiant FC</span>
		</header>
		<USlideover
			v-model:open="mobileOpen"
			side="left"
			title="Admin menu"
			description="Go to a section or manage your account"
			:ui="{ content: 'max-w-72' }"
		>
			<template #content>
				<AdminSidebar
					expanded
					closable
					:user="user"
					@navigate="mobileOpen = false"
					@create-admin="openModal = true"
					@sign-out="signOut"
				/>
			</template>
		</USlideover>

		<!-- desktop: a rail that can be collapsed to icons, and opens while hovered -->
		<aside
			class="hidden lg:block fixed inset-y-0 left-0 z-40 border-e border-default transition-[width,box-shadow] duration-200 ease-out motion-reduce:transition-none"
			:class="[
				expanded ? 'w-64' : 'w-[72px]',
				// opened over the page by hover or focus: lift it off the content
				collapsed && expanded ? 'shadow-lg' : '',
			]"
			@mouseenter="hoverStart"
			@mouseleave="hoverEnd"
			@focusin="focusEntered"
			@focusout="focusLeft"
		>
			<AdminSidebar
				:expanded="expanded"
				collapsible
				:collapsed="collapsed"
				:user="user"
				@toggle="toggleCollapsed"
				@create-admin="openModal = true"
				@sign-out="signOut"
				@menu-open="(open) => (menuOpen = open)"
			/>
		</aside>

		<!-- flow-root keeps page headings' top margins inside main -->
		<main
			class="flow-root transition-[margin] duration-200 ease-out motion-reduce:transition-none"
			:class="collapsed ? 'lg:ms-[72px]' : 'lg:ms-64'"
		>
			<slot />
		</main>
		<UModal
			v-model:open="openModal"
			title="Add a new admin"
			:ui="{ title: 'text-primary font-bold text-xl capitalize' }"
		>
			<template #body>
				<UForm
					:state="state"
					:schema="schema"
					class="flex flex-col gap-2"
					@submit="createUser"
				>
					<UFormField label="First Name" required name="firstName">
						<UInput placeholder="First name" v-model="state.firstName" />
					</UFormField>
					<UFormField label="Last Name" required name="lastName">
						<UInput placeholder="Last name" v-model="state.lastName" />
					</UFormField>
					<UFormField label="Phone Number" required name="phone">
						<UInput placeholder="Phone number" v-model="state.phone" />
					</UFormField>
					<UFormField label="Email" required name="email">
						<UInput placeholder="email" type="email" v-model="state.email" />
					</UFormField>
					<UFormField label="Password" required name="password">
						<UInput
							placeholder="password"
							type="password"
							v-model="state.password"
						/>
					</UFormField>
					<UFormField class="mt-2">
						<UButton type="submit" label="Submit" />
					</UFormField>
				</UForm>
			</template>
		</UModal>
	</div>
</template>

<script setup lang="ts">
	// import { auth, fireStore } from '~/config/firebase'
	import {
		createUserWithEmailAndPassword,
		onAuthStateChanged,
		updateProfile,
	} from "firebase/auth";
	import { addDoc, collection, doc, setDoc } from "firebase/firestore";
	import { useStorage } from "@vueuse/core";
	import { z } from "zod";
	import type { FirebaseState } from "~/types/Firebase";
	const firebase = useState<FirebaseState>("firebase");

	/* ---------- sidebar ---------- */

	// desktop: the admin's choice to keep the sidebar collapsed is remembered on this device
	const collapsed = useStorage("vfc-admin-sidebar-collapsed", false);
	const hovering = ref(false);
	const focusInside = ref(false);
	const menuOpen = ref(false);
	const expanded = computed(
		() =>
			!collapsed.value || hovering.value || focusInside.value || menuOpen.value,
	);

	// a short pause before opening, so passing the pointer across the rail does not open it
	let hoverTimer: ReturnType<typeof setTimeout> | undefined;
	// after "Collapse sidebar" is clicked, the pointer is still over the rail;
	// ignore it until it leaves so the rail closes straight away
	let ignoreHover = false;
	const hoverStart = () => {
		if (ignoreHover) return;
		hoverTimer = setTimeout(() => {
			hovering.value = true;
		}, 150);
	};
	const hoverEnd = () => {
		clearTimeout(hoverTimer);
		hovering.value = false;
		ignoreHover = false;
	};
	const toggleCollapsed = () => {
		collapsed.value = !collapsed.value;
		if (collapsed.value) {
			ignoreHover = true;
			hovering.value = false;
			focusInside.value = false;
		}
	};
	// only keyboard focus opens the rail; a mouse click also focuses what it
	// clicks, and that should not hold the rail open
	const focusEntered = (event: FocusEvent) => {
		if ((event.target as HTMLElement).matches(":focus-visible")) {
			focusInside.value = true;
		}
	};
	const focusLeft = (event: FocusEvent) => {
		const sidebar = event.currentTarget as HTMLElement;
		if (!sidebar.contains(event.relatedTarget as Node | null))
			focusInside.value = false;
	};

	// phones and tablets
	const mobileOpen = ref(false);
	const route = useRoute();
	watch(
		() => route.path,
		() => {
			mobileOpen.value = false;
		},
	);

	/* ---------- signed-in admin ---------- */

	const user = ref<{ name: string; email: string } | null>(null);
	let stopWatchingAuth: (() => void) | undefined;
	onMounted(() => {
		stopWatchingAuth = onAuthStateChanged(firebase.value.auth, (current) => {
			user.value = current
				? {
						name: current.displayName || current.email || "Admin",
						email: current.email ?? "",
					}
				: null;
		});
	});
	onBeforeUnmount(() => stopWatchingAuth?.());

	const signOut = async () => {
		await firebase.value.auth.signOut();
		navigateTo("/admin/login");
	};

	/* ---------- create admin ---------- */

	const openModal = ref(false);
	const isLoading = ref(false);
	const schema = z.object({
		firstName: z.string(),
		lastName: z.string(),
		phone: z.string(),
		email: z.string().email("Invalid Email"),
		password: z.string().min(10),
	});

	type Schema = z.output<typeof schema>;

	const state = reactive({
		firstName: undefined,
		lastName: undefined,
		phone: undefined,
		email: "",
		password: "",
	});

	// const userStore = useUserStore()
	const createUser = async () => {
		isLoading.value = true;
		try {
			const userCredential = await createUserWithEmailAndPassword(
				firebase.value?.auth,
				state.email,
				state.password,
			);
			const user = await userCredential.user;
			updateProfile(userCredential.user, {
				displayName: `${state.firstName} ${state.lastName}`,
			}).then(() => {
				const docRef = doc(firebase.value?.fireStore, "users", user.uid);
				setDoc(docRef, {
					firstName: state.firstName,
					lastName: state.lastName,
					phone: state.phone,
					email: state.email,
				});
			});
			await $fetch("/api/create-admin", {
				method: "POST",
				body: { email: state.email },
			});
			state.firstName = undefined;
			state.lastName = undefined;
			state.phone = undefined;
			state.email = "";
			state.password = "";
			openModal.value = false;
			isLoading.value = false;
		} catch (e) {
			console.log(e);
			isLoading.value = false;
		}
	};
</script>
