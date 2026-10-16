<template>

    <Head>
        <Title>Publish News | Valiant FC</Title>
    </Head>
    <div class="flex items-center justify-center  max-w-[1024px] w-full">
        <UForm :state="state" class="flex flex-col gap-6" @submit="publish" :schema="schema">
            <UFormField class="w-full mx-auto" required size="lg" name="title">
                <template #label>
                    <p class="inline text-highlighted font-semibold text-xl  me-1">Title</p>
                </template>
                <UInput v-model="state.title" placeholder="New update on Valiant FC" class="mt-2" />
            </UFormField>
            <UFormField class="flex flex-col gap-2" required name="banner">
                <template #label>
                    <p class="inline text-highlighted font-semibold text-sm  me-1">Add Banner Image</p>

                </template>
                <template #default>

                    <label
                        class="text-white border-2 border-primary px-4 py-1 shadow-md rounded-md bg-primary font-bold flex items-center gap-2 w-max"
                        for="banner">
                        <UIcon name="i-material-symbols-drive-folder-upload-outline-rounded" class="text-lg" />
                        Upload
                    </label>
                    <input type="file" :accept="IMAGE_ACCEPT" id="banner" class="opacity-0" ref="inputFile" required
                        @change="previewFile" />
                    <div class="h-[250px] my-4" v-show="!hidePreview">
                        <img ref="imagePreview" class="w-full h-full" />
                    </div>

                </template>
                <template #error v-if="inputFile?.files == null">
                    <p>Please add an image as the banner.</p>
                </template>
            </UFormField>
            <UFormField name="content">
                <TipTap class=" bg-default ring-1 ring-default shadow-sm w-full mx-auto rounded-[8px] py-6 px-8" v-model="state.content" />

            </UFormField>
            <UFormField class=" flex justify-end">

                <UButton class="inline-block font-bold text-lg px-12 shadow-md " size="lg" type="submit"
                    :loading="isLoading">
                    Publish
                </UButton>
            </UFormField>
        </UForm>

    </div>
</template>

<script setup lang="ts">
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { z } from 'zod'
import type { FirebaseState } from '~/types/Firebase'

definePageMeta({
    layout: 'admin'
})
const isLoading = ref(false)
const success = ref(false)
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

const firebase = useState<FirebaseState>('firebase')
const uploadImage = useImageUpload()
const toast = useToast()

// the banner goes to Supabase Storage; the article itself is still kept in Firestore
const publish = async () => {
    const banner = inputFile.value?.files?.[0]
    if (!banner) return
    isLoading.value = true
    try {
        state.bannerUrl = await uploadImage(banner, 'news')
        await addDoc(collection(firebase.value.fireStore, 'news'), {
            ...state,
            publishedAt: Timestamp.now(),
        })
        success.value = true
        toast.add({ title: 'Article published', description: state.title, color: 'success' })
    } catch (error) {
        toast.add({ title: 'Could not publish the article', description: fetchErrorMessage(error), color: 'error' })
    } finally {
        isLoading.value = false
    }
}

// watch(success, (newValue) => {
//     if (newValue == true) {
//         setTimeout(() => {
//             state.content = ''
//             state.title = ''
//             state.bannerUrl = ''
//         }, 2000)
//     }
// })
const imagePreview = ref<HTMLImageElement | null>()
const hidePreview = ref(true)

const previewFile: (payload: Event) => void = (payload) => {

    imagePreview.value!.src = URL.createObjectURL(payload.target?.files[0])
    hidePreview.value = false

}
</script>

<style scoped></style>
