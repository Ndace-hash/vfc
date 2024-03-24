<template>
    <section>
        <h1 class="text-white capitalize text-2xl max-w-[1024px] mx-auto my-6">Clubs <span
                class="font-semibold">List</span>
        </h1>
        <div
            class="bg-white max-w-[1024px] h-full max-h-[600px] mx-auto rounded-[8px] shadow-lg my-10 overflow-y-hidden">
            <div class="flex items-center py-4 px-4 justify-between border-b border-admin-light">
                <button
                    class="flex bg-primary text-white border-2 border-primary items-center justify-center gap-1   font-semibold py-2 px-4 rounded-full md:hover:shadow-md duration-200 ease-in "
                    @click="isOpen = true">
                    <span>New club</span>
                    <IconPlus width="30px" color="#ffffff" />
                </button>
                <div class="flex gap-2 items-center">
                    <UButton
                        class="bg-transparent text-admin-dark flex items-center border-2 border-primary hover:text-white"
                        @click="refresh" :disabled="isRefreshing">
                        <IconRefresh width="15px"
                            :class="isRefreshing ? 'duration-1000 ease-linear animate-spin' : ''" />
                        Refresh
                    </UButton>
                    <UInput placeholder="filter clubs..." v-model="q" />
                </div>
            </div>
            <div>
                <UCard>
                    <div v-for="club in filteredClubs" :key="club.id" class="flex items-center">
                        <div class="w-[70px]">
                            <img :src="club.logo" :alt="club.name" class="w-full h-full">
                        </div>
                        <p>
                            {{ club.name }}
                        </p>
                    </div>

                </UCard>
            </div>
        </div>
        <UModal v-model="isOpen">
            <UCard>
                <template #header>
                    <h1 class="text-primary font-semibold text-xl capitalize">Add new club</h1>
                </template>

                <UForm :state="state" @submit="submit" :schema="schema">
                    <UFormGroup label="Club logo " class="mb-4">

                        <label for="club"
                            class="border border-primary w-max flex items-center justify-center gap-2 py-2 px-4 rounded-[8px]">
                            <UIcon name="i-ant-design-upload-outlined" dynamic />
                            Upload
                        </label>
                        <input type="file" id="club" ref="inputFile" class="hidden" accept=".jpg, .png, .jpeg"
                            @change="uploadFile" required />
                    </UFormGroup>
                    <UFormGroup label="Club name" class="mb-4" name="name">
                        <UInput placeholder="Club name" v-model="state.name" />
                    </UFormGroup>
                    <div class="w-[150px] mb-4" v-show="!hidePreview">
                        <img ref="imagePreview" class="w-full h-full" />
                    </div>
                    <UButton type="submit" :loading="isLoading">Add</UButton>
                </UForm>
            </UCard>
        </UModal>
    </section>
</template>

<script setup lang="ts">
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { getDocs, addDoc, collection, type DocumentData } from 'firebase/firestore'
import { storage, fireStore } from '~/config/firebase'
import { z } from 'zod'
definePageMeta({
    layout: 'admin'
})
const isOpen = ref(false)
const inputFile = ref<HTMLInputElement | null>()
const imagePreview = ref<HTMLImageElement | null>()
const isLoading = ref(false)
const hidePreview = ref(true)
const state = reactive({
    logo: '',
    name: undefined as undefined | string
})
const schema = z.object({
    name: z.string()
})

const clubColRef = collection(fireStore, 'clubs')
const clubs = ref<DocumentData[]>([])

onBeforeMount(() => {
    getDocs(clubColRef).then(snapshot => {
        snapshot.docs.forEach(doc => {
            const data = doc.data()
            clubs.value.push({ id: doc.id, logo: data.logo, name: data.name })
        })
    })
})
const refresh = () => {
    isRefreshing.value = true
    try {
        clubs.value = []
        getDocs(clubColRef).then(snapshot => {
            snapshot.docs.forEach(doc => {
                const data = doc.data()
                clubs.value.push({ id: doc.id, logo: data.logo, name: data.name })
            })
        })
        isRefreshing.value = false
    } catch (e) {
        isRefreshing.value = false
        console.log(e)
    }
}
const q = ref('')

const filteredClubs = computed(() => {
    if (!q.value) {
        return clubs.value
    }
    return clubs.value.filter((player) => {
        return Object.values(player).some((value) => {
            return String(value).toLowerCase().includes(q.value.toLowerCase())
        })
    })
})
const isRefreshing = ref(false)

const submit = async () => {
    isLoading.value = true
    const clubName = state.name
    const fileName = state.name?.trim().toLowerCase().replaceAll(' ', '_')
    if (inputFile.value?.files !== null) {
        try {
            const clubRef = storageRef(storage, `clubs/${fileName}`)

            await uploadBytes(clubRef, inputFile.value!.files[0]).then((snapshot: any) => {
                getDownloadURL(snapshot.ref).then((url) => {
                    state.logo = url
                    addDoc(clubColRef, {
                        logo: state.logo,
                        name: clubName
                    })
                })
            }).then(() => {
                state.name = ''
                state.logo = ''
                inputFile.value!.files = null
                hidePreview.value = true
                imagePreview.value!.src = ''
                isLoading.value = false
            })
        } catch (e) {
            console.error(e)
            isLoading.value = false
        }
    }

}
const uploadFile: (payload: Event) => void = (payload) => {
    imagePreview.value!.src = URL.createObjectURL(payload.target?.files[0])
    hidePreview.value = false
}
</script>

<style scoped></style>