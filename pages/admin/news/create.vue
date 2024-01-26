<template>
    <div class="flex items-center justify-center h-screen max-w-[1024px] w-full">
        <UForm :state="state" class="flex flex-col gap-6">
            <UFormGroup class="w-full mx-auto" required size="lg">
                <template #label>
                    <p class="inline text-white font-semibold text-xl  me-1">Title</p>
                </template>
                <UInput :model-value="state.title" placeholder="New update on Valiant FC" class="mt-2" />
            </UFormGroup>
            <UFormGroup>
                <TipTap class=" bg-white w-[80%] mx-auto rounded-[8px] py-6 px-8" v-model="state.content" />

            </UFormGroup>
            <UFormGroup class=" flex justify-end">

                <UButton class="inline-block font-bold text-lg px-12 shadow-md " size="lg">Publish</UButton>
            </UFormGroup>
        </UForm>

    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'admin'
})
const state = reactive({
    title: '',
    content: ''
})
</script>

<style scoped></style>
