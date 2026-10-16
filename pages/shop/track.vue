<template>
	<section class="mx-auto max-w-md px-4 pt-8 md:pt-12">
		<h1 class="text-3xl font-bold text-highlighted">Track your order</h1>
		<p class="mt-2 text-toned">
			Enter your order number (it starts with VFC-) and the email you used at checkout.
		</p>
		<UForm :state="state" :schema="schema" class="mt-6 flex flex-col gap-4" @submit="find">
			<UFormField label="Order number" name="reference" required>
				<UInput
					v-model="state.reference"
					placeholder="VFC-7K2M9QXA"
					autocapitalize="characters"
					size="lg"
					class="font-mono"
				/>
			</UFormField>
			<UFormField label="Email" name="email" required>
				<UInput v-model="state.email" type="email" autocomplete="email" size="lg" />
			</UFormField>
			<UButton type="submit" size="lg" block>Find my order</UButton>
		</UForm>
	</section>
</template>

<script setup lang="ts">
	import { z } from "zod";

	useSeoMeta({ title: `Track your order | ${CLUB_NAME}` });

	const lastOrder = useLastOrder();

	const schema = z.object({
		reference: z
			.string()
			.trim()
			.regex(/^vfc-[a-z0-9]{8}$/i, "Order numbers look like VFC-7K2M9QXA"),
		email: z.string().trim().pipe(z.email("Enter a valid email address")),
	});

	const state = reactive({
		reference: lastOrder.value?.reference ?? "",
		email: lastOrder.value?.email ?? "",
	});

	const find = () => {
		const reference = state.reference.trim().toUpperCase();
		lastOrder.value = { reference, email: state.email.trim() };
		navigateTo(`/shop/orders/${reference}`);
	};
</script>
