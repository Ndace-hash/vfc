<template>

    <Head>
        <Title>Publish News | Valiant FC</Title>
    </Head>
    <div class="flex items-center justify-center  max-w-[1024px] w-full">
        <UForm :state="state" class="flex flex-col gap-6" @submit="publish">
            <UFormGroup class="w-full mx-auto" required size="lg">
                <template #label>
                    <p class="inline text-white font-semibold text-xl  me-1">Title</p>
                </template>
                <UInput v-model="state.title" placeholder="New update on Valiant FC" class="mt-2" />
            </UFormGroup>
            <UFormGroup class="flex flex-col gap-2">
                <template #label>
                    <p class="inline text-white font-semibold text-sm  me-1">Add Banner Image</p>

                </template>
                <template #default>

                    <label
                        class="text-white border-2 border-primary px-4 py-1 shadow-md rounded-md bg-primary font-bold flex items-center gap-2 w-max"
                        for="banner">
                        <UIcon name="i-material-symbols-drive-folder-upload-outline-rounded" dynamic class="text-lg" />
                        Upload
                    </label>
                    <input type="file" accept=".jpg,.png,.jpeg" id="banner" class="hidden" />
                </template>
            </UFormGroup>
            <UFormGroup>
                <TipTap class=" bg-white w-full mx-auto rounded-[8px] py-6 px-8" v-model="state.content" />

            </UFormGroup>
            <UFormGroup class=" flex justify-end">

                <UButton class="inline-block font-bold text-lg px-12 shadow-md " size="lg" type="submit">Publish
                </UButton>
            </UFormGroup>
        </UForm>

    </div>
</template>

<script setup lang="ts">
import { fireStore } from '~/config/firebase'
import { collection, addDoc } from 'firebase/firestore'

definePageMeta({
    layout: 'admin'
})
const state = reactive({
    title: '',
    content: ''
})

const publish = () => {
    addDoc(collection(fireStore, 'news'), state).then(snapshot => {
        console.log(snapshot)
    })
}
</script>

<style scoped></style>
