<template>
	<div class="flex h-full flex-col bg-admin-dark text-white">
		<div class="flex h-16 shrink-0 items-center gap-3 px-4">
			<img src="/valiant.png" alt="" class="size-9 shrink-0" />
			<span :class="labelClass" class="text-[15px] font-semibold"
				>Valiant FC</span
			>
			<button
				v-if="collapsible && expanded"
				type="button"
				class="ms-auto grid size-9 shrink-0 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
				:aria-label="collapsed ? 'Keep sidebar open' : 'Collapse sidebar'"
				:aria-pressed="!collapsed"
				@click="$emit('toggle')"
			>
				<UIcon
					:name="
						collapsed ? 'i-bi-layout-sidebar' : 'i-bi-layout-sidebar-inset'
					"
					class="size-5"
				/>
			</button>
			<button
				v-if="closable"
				type="button"
				class="ms-auto grid size-11 shrink-0 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-white"
				aria-label="Close menu"
				@click="$emit('navigate')"
			>
				<UIcon name="i-bi-x-lg" class="size-5" />
			</button>
		</div>

		<nav
			aria-label="Admin"
			class="flex-1 overflow-x-hidden overflow-y-auto px-3 py-2"
		>
			<ul class="flex flex-col gap-1">
				<li v-for="item in NAV_ITEMS" :key="item.to">
					<NuxtLink
						:to="item.to"
						:class="itemClass(isActive(item.to))"
						:aria-current="isActive(item.to) ? 'page' : undefined"
						@click="$emit('navigate')"
					>
						<UIcon
							:name="isActive(item.to) ? item.activeIcon : item.icon"
							class="size-5 shrink-0"
							aria-hidden="true"
						/>
						<span :class="labelClass">{{ item.label }}</span>
					</NuxtLink>
				</li>
			</ul>

			<div class="mt-4 border-t border-white/10 pt-4">
				<button
					type="button"
					:class="itemClass(false)"
					:aria-expanded="systemOpen"
					aria-controls="system-management"
					@click="systemOpen = !systemOpen"
				>
					<UIcon name="i-bi-gear" class="size-5 shrink-0" aria-hidden="true" />
					<span :class="labelClass" class="flex-1 text-left"
						>System management</span
					>
					<UIcon
						v-if="expanded"
						name="i-bi-chevron-down"
						class="size-4 shrink-0 text-white/60 transition-transform duration-200 motion-reduce:transition-none"
						:class="systemOpen ? 'rotate-180' : ''"
						aria-hidden="true"
					/>
				</button>
				<ul
					v-show="systemOpen"
					id="system-management"
					class="mt-1 flex flex-col gap-1"
					:class="expanded ? 'ps-4' : ''"
				>
					<li>
						<button
							type="button"
							:class="itemClass(false)"
							@click="
								$emit('create-admin');
								$emit('navigate');
							"
						>
							<UIcon
								name="i-bi-person-plus"
								class="size-5 shrink-0"
								aria-hidden="true"
							/>
							<span :class="labelClass">Create admin</span>
						</button>
					</li>
				</ul>
			</div>
		</nav>

		<div class="shrink-0 border-t border-white/10 p-3">
			<UDropdownMenu
				:items="accountMenu"
				:content="{ side: 'top', align: 'start' }"
				:ui="{ content: 'w-60' }"
				@update:open="(open) => $emit('menu-open', open)"
			>
				<button
					type="button"
					class="flex min-h-11 w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
					:aria-label="`Account: ${user?.name ?? 'signed in'}. Opens sign out`"
				>
					<span
						class="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold"
						aria-hidden="true"
						>{{ initials }}</span
					>
					<span :class="labelClass" class="min-w-0 flex-1">
						<span class="block truncate text-sm font-semibold">{{
							user?.name
						}}</span>
						<span
							v-if="user?.email && user.email !== user.name"
							class="block truncate text-xs text-white/60"
							>{{ user.email }}</span
						>
					</span>
					<UIcon
						v-if="expanded"
						name="i-bi-chevron-expand"
						class="size-4 shrink-0 text-white/60"
						aria-hidden="true"
					/>
				</button>
			</UDropdownMenu>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { DropdownMenuItem } from "@nuxt/ui";

	const props = defineProps<{
		// show labels; when false only the icons are visible
		expanded: boolean;
		// desktop: show the button that keeps the sidebar open or collapsed
		collapsible?: boolean;
		collapsed?: boolean;
		// mobile drawer: show a close button
		closable?: boolean;
		user: { name: string; email: string } | null;
	}>();

	const emit = defineEmits<{
		toggle: [];
		// a destination was chosen (closes the mobile drawer)
		navigate: [];
		"create-admin": [];
		"sign-out": [];
		// the account menu is open, so the sidebar should stay expanded
		"menu-open": [open: boolean];
	}>();

	const NAV_ITEMS = [
		{
			label: "Players",
			to: "/admin/players",
			icon: "i-bi-people",
			activeIcon: "i-bi-people-fill",
		},
		{
			label: "Teams",
			to: "/admin/teams",
			icon: "i-bi-shield",
			activeIcon: "i-bi-shield-fill",
		},
		{
			label: "News",
			to: "/admin/news",
			icon: "i-bi-newspaper",
			activeIcon: "i-bi-newspaper",
		},
		{
			label: "Fixtures",
			to: "/admin/fixture",
			icon: "i-bi-calendar-event",
			activeIcon: "i-bi-calendar-event-fill",
		},
	];

	const route = useRoute();
	const isActive = (to: string) => route.path.startsWith(to);

	const systemOpen = ref(false);

	// labels stay readable by screen readers when only icons are shown
	const labelClass = computed(() => (props.expanded ? "truncate" : "sr-only"));

	const itemClass = (active: boolean) => [
		"flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-[15px] transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-white",
		active
			? "bg-white/15 font-semibold text-white"
			: "text-white/80 hover:bg-white/10 hover:text-white",
	];

	// "Chinedu Okafor" -> "CO", "admin@valiantfc.com" -> "A"
	const initials = computed(() => {
		const name = props.user?.name?.trim();
		if (!name) return "?";
		if (name.includes("@")) return name[0]!.toUpperCase();
		return name
			.split(/\s+/)
			.slice(0, 2)
			.map((word) => word[0]!.toUpperCase())
			.join("");
	});

	const accountMenu = computed<DropdownMenuItem[][]>(() => [
		[
			{
				type: "label",
				label: props.user?.name ?? "Signed in",
				description: props.user?.email,
			},
		],
		[
			{
				label: "Sign out",
				icon: "i-bi-box-arrow-right",
				onSelect: () => emit("sign-out"),
			},
		],
	]);
</script>
