<template>
	<div
		class="inline-flex items-center rounded-lg ring-1 ring-accented"
		role="group"
		:aria-label="label"
	>
		<button
			type="button"
			class="grid size-11 place-items-center rounded-s-lg text-highlighted hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary disabled:text-dimmed disabled:hover:bg-transparent"
			:disabled="modelValue <= min"
			:aria-label="`Fewer (${label})`"
			@click="$emit('update:modelValue', modelValue - 1)"
		>
			<UIcon name="i-bi-dash" class="size-5" />
		</button>
		<output class="min-w-8 text-center font-semibold tabular-nums" aria-live="polite">{{
			modelValue
		}}</output>
		<button
			type="button"
			class="grid size-11 place-items-center rounded-e-lg text-highlighted hover:bg-elevated focus-visible:outline-2 focus-visible:outline-primary disabled:text-dimmed disabled:hover:bg-transparent"
			:disabled="modelValue >= max"
			:aria-label="`More (${label})`"
			@click="$emit('update:modelValue', modelValue + 1)"
		>
			<UIcon name="i-bi-plus" class="size-5" />
		</button>
	</div>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			modelValue: number;
			// what is being counted, for screen readers: "Quantity of Home jersey"
			label: string;
			min?: number;
			max?: number;
		}>(),
		{ min: 1, max: MAX_QUANTITY },
	);
	defineEmits<{ "update:modelValue": [value: number] }>();
</script>
