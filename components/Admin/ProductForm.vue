<template>
	<UForm
		:state="state"
		:schema="productInputSchema"
		class="flex flex-col gap-6"
		@submit="submit"
	>
		<!-- images: uploaded as soon as they are chosen; the first is the cover -->
		<section aria-labelledby="product-images">
			<h3 id="product-images" class="text-sm font-semibold text-highlighted">
				Photos
			</h3>
			<p class="mt-0.5 text-xs text-muted">
				The first photo is the one shown in the shop. Square photos look best.
			</p>
			<ul class="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
				<li
					v-for="(url, index) in state.image_urls"
					:key="url"
					class="group relative aspect-square overflow-hidden rounded-lg bg-elevated ring-1 ring-default"
				>
					<img :src="url" alt="" class="size-full object-cover" />
					<UBadge
						v-if="index === 0"
						size="sm"
						class="absolute left-1.5 top-1.5"
						>Cover</UBadge
					>
					<div class="absolute right-1 top-1 flex gap-1">
						<UButton
							v-if="index > 0"
							size="xs"
							color="neutral"
							variant="solid"
							icon="i-bi-star"
							:aria-label="`Make photo ${index + 1} the cover`"
							@click="makeCover(index)"
						/>
						<UButton
							size="xs"
							color="neutral"
							variant="solid"
							icon="i-bi-trash3"
							:aria-label="`Remove photo ${index + 1}`"
							@click="state.image_urls.splice(index, 1)"
						/>
					</div>
				</li>
				<li v-if="state.image_urls.length < 8">
					<button
						type="button"
						class="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg text-sm text-toned ring-1 ring-dashed ring-accented hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary"
						:disabled="uploading"
						@click="imageInput?.click()"
					>
						<UIcon
							:name="uploading ? 'i-heroicons-arrow-path-20-solid' : 'i-bi-plus'"
							class="size-6"
							:class="uploading ? 'animate-spin' : ''"
						/>
						{{ uploading ? "Uploading…" : "Add photo" }}
					</button>
				</li>
			</ul>
			<input
				ref="imageInput"
				type="file"
				:accept="IMAGE_ACCEPT"
				multiple
				class="hidden"
				@change="addImages"
			/>
		</section>

		<UFormField label="Product name" name="name" required>
			<UInput v-model="state.name" placeholder="e.g. Home jersey 2026" />
		</UFormField>

		<UFormField
			label="Web address"
			name="slug"
			required
			:description="`The product’s page will be /shop/${state.slug || '…'}`"
		>
			<UInput v-model="state.slug" @update:model-value="slugEdited = true" />
		</UFormField>

		<div class="grid grid-cols-2 gap-4">
			<UFormField label="Price (₦)" name="price" required>
				<UInput
					v-model.number="state.price"
					type="number"
					min="0"
					step="50"
					inputmode="decimal"
				/>
			</UFormField>
			<UFormField
				label="Option name"
				name="option_name"
				required
				description="What customers choose, e.g. Size."
			>
				<UInput v-model="state.option_name" />
			</UFormField>
		</div>

		<UFormField label="Description" name="description">
			<UTextarea v-model="state.description" :rows="4" class="w-full" />
		</UFormField>

		<!-- sizes and stock -->
		<section aria-labelledby="product-variants">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<h3 id="product-variants" class="text-sm font-semibold text-highlighted">
					{{ state.option_name || "Options" }} and stock
				</h3>
				<div v-if="!state.variants.length" class="flex gap-2">
					<UButton size="xs" variant="soft" @click="addPreset(['S', 'M', 'L', 'XL', 'XXL'])"
						>Add S–XXL</UButton
					>
					<UButton size="xs" variant="soft" @click="addPreset(['One size'])"
						>One size</UButton
					>
				</div>
			</div>
			<UFormField name="variants" class="mt-2">
				<ul class="flex flex-col gap-2">
					<li
						v-for="(variant, index) in state.variants"
						:key="variant.key"
						class="grid grid-cols-[1fr_6rem_auto_auto] items-start gap-2"
					>
						<UFormField :name="`variants.${index}.label`">
							<UInput
								v-model="variant.label"
								placeholder="e.g. M"
								:aria-label="`${state.option_name} ${index + 1} name`"
							/>
						</UFormField>
						<UFormField :name="`variants.${index}.stock`">
							<UInput
								v-model.number="variant.stock"
								type="number"
								min="0"
								:aria-label="`Stock for ${variant.label || `option ${index + 1}`}`"
							/>
						</UFormField>
						<USwitch
							v-model="variant.is_active"
							label="For sale"
							class="h-8"
							:ui="{ label: 'text-xs' }"
						/>
						<UButton
							color="neutral"
							variant="ghost"
							icon="i-bi-trash3"
							:aria-label="`Remove ${variant.label || `option ${index + 1}`}`"
							@click="state.variants.splice(index, 1)"
						/>
					</li>
				</ul>
			</UFormField>
			<UButton
				class="mt-2"
				size="sm"
				variant="ghost"
				icon="i-bi-plus"
				@click="addPreset([''])"
				>Add {{ (state.option_name || "option").toLowerCase() }}</UButton
			>
		</section>

		<div class="flex flex-col gap-3 border-t border-default pt-5">
			<USwitch
				v-model="state.is_active"
				label="Published"
				description="Show this product in the shop."
			/>
			<USwitch
				v-model="state.is_featured"
				label="Featured"
				description="Also show it on the home page."
			/>
			<UFormField
				label="Order"
				name="display_order"
				description="Lower numbers come first in the shop."
				class="max-w-40"
			>
				<UInput v-model.number="state.display_order" type="number" min="0" />
			</UFormField>
		</div>

		<div class="flex justify-end gap-2">
			<UButton
				color="neutral"
				variant="ghost"
				:disabled="loading"
				@click="$emit('cancel')"
				>Cancel</UButton
			>
			<UButton type="submit" :loading="loading" :disabled="uploading" class="px-6"
				>{{ product ? "Save changes" : "Add product" }}
			</UButton>
		</div>
	</UForm>
</template>

<script setup lang="ts">
	import type { FormSubmitEvent } from "@nuxt/ui";
	import type { AdminProduct } from "~/types/Shop";

	const props = defineProps<{
		// the product being edited; leave out to add a new one
		product?: AdminProduct | null;
		loading?: boolean;
	}>();

	const emit = defineEmits<{
		submit: [product: ProductInput];
		cancel: [];
	}>();

	const uploadImage = useImageUpload();
	const toast = useToast();

	// `key` keeps each row's inputs attached to it while rows are added and removed
	let nextKey = 0;
	const variantRow = (variant?: Partial<AdminProduct["variants"][number]>) => ({
		key: nextKey++,
		id: variant?.id,
		label: variant?.label ?? "",
		stock: variant?.stock ?? 0,
		is_active: variant?.is_active ?? true,
	});

	const state = reactive({
		name: props.product?.name ?? "",
		slug: props.product?.slug ?? "",
		description: props.product?.description ?? "",
		price: props.product ? toNaira(props.product.price_kobo) : (undefined as number | undefined),
		option_name: props.product?.option_name ?? "Size",
		image_urls: [...(props.product?.image_urls ?? [])],
		is_active: props.product?.is_active ?? false,
		is_featured: props.product?.is_featured ?? false,
		display_order: props.product?.display_order ?? 0,
		variants: (props.product?.variants ?? []).map(variantRow),
	});

	// a new product's web address follows its name until someone edits it
	const slugEdited = ref(!!props.product);
	watch(
		() => state.name,
		(name) => {
			if (!slugEdited.value) state.slug = slugify(name);
		},
	);

	const addPreset = (labels: string[]) => {
		state.variants.push(...labels.map((label) => variantRow({ label })));
	};

	/* ---------- photos ---------- */

	const imageInput = ref<HTMLInputElement | null>(null);
	const uploading = ref(false);

	const addImages = async (event: Event) => {
		const input = event.target as HTMLInputElement;
		const files = [...(input.files ?? [])].slice(0, 8 - state.image_urls.length);
		uploading.value = true;
		try {
			for (const file of files) state.image_urls.push(await uploadImage(file, "products"));
		} catch (error) {
			toast.add({
				title: "Could not upload a photo",
				description: fetchErrorMessage(error),
				color: "error",
			});
		} finally {
			uploading.value = false;
			input.value = "";
		}
	};

	const makeCover = (index: number) => {
		const [url] = state.image_urls.splice(index, 1);
		state.image_urls.unshift(url!);
	};

	const submit = (event: FormSubmitEvent<ProductInput>) => {
		emit("submit", event.data);
	};
</script>
