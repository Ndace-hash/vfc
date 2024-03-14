<template>

    <Head>
        <Title>Publish News | Valiant FC</Title>
    </Head>
    <div class="flex items-center justify-center  max-w-[1024px] w-full">
        <UForm :state="state" class="flex flex-col gap-6" @submit="publish" :schema="schema">
            <UFormGroup class="w-full mx-auto" required size="lg" name="title">
                <template #label>
                    <p class="inline text-white font-semibold text-xl  me-1">Title</p>
                </template>
                <UInput v-model="state.title" placeholder="New update on Valiant FC" class="mt-2" />
            </UFormGroup>
            <UFormGroup class="flex flex-col gap-2" required name="banner">
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
                    <input type="file" accept=".jpg,.png,.jpeg" id="banner" class="opacity-0" ref="inputFile" required
                        @change="previewFile" />
                    <div class="h-[250px] my-4" v-show="!hidePreview">
                        <img ref="imagePreview" class="w-full h-full" />
                    </div>

                </template>
                <template #error v-if="inputFile?.files == null">
                    <p>Please add an image as the banner.</p>
                </template>
            </UFormGroup>
            <UFormGroup name="content">
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
import { fireStore, storage } from '~/config/firebase'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { z } from 'zod'

definePageMeta({
    layout: 'admin'
})
const schema = z.object({
    title: z.string().min(10),
    content: z.string().min(50)
})
const state = reactive({
    title: '',
    content: '',
    bannerUrl: ''
})
const inputFile = ref<HTMLInputElement | null>()


const publish = async () => {
    const fileName = `${state.title.replaceAll(' ', '_')}.jpg`
    if (inputFile.value?.files !== null) {
        const clubRef = storageRef(storage, `news/${fileName}`)

        await uploadBytes(clubRef, inputFile.value!.files[0]).then((snapshot: any) => {
            getDownloadURL(snapshot.ref).then((url) => {
                state.bannerUrl = url
            }).then(() => {

                addDoc(collection(fireStore, 'news'), {
                    ...state,
                    publishedAt: Timestamp.now()

                }).then(snapshot => {
                    console.log(snapshot)
                })
            })
        })

    }

}
const imagePreview = ref<HTMLImageElement | null>()
const hidePreview = ref(true)

const previewFile: (payload: Event) => void = (payload) => {

    imagePreview.value!.src = URL.createObjectURL(payload.target?.files[0])
    hidePreview.value = false

}
</script>

<style scoped></style>
