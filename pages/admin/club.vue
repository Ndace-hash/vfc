<template>
    <section>
        <h1 class="text-white capitalize text-2xl max-w-[1024px] mx-auto my-6">Clubs <span class="font-semibold">List</span>
        </h1>
        <div class="bg-white max-w-[1024px] h-full max-h-[600px] mx-auto rounded-[8px] shadow-lg my-10 overflow-y-hidden">
            <div class="flex items-center py-4 px-4 justify-between border-b border-admin-light">
                <button
                    class="flex bg-primary text-white border-2 border-primary items-center justify-center gap-1   font-semibold py-2 px-4 rounded-full md:hover:shadow-md duration-200 ease-in ">
                    <span>New club</span>
                    <IconPlus width="30px" color="#ffffff" />
                </button>
                <div class="flex gap-2 items-center">
                    <UButton
                        class="bg-transparent text-admin-dark flex items-center border-2 border-primary hover:text-white">
                        <IconRefresh width="15px" />
                        Refresh
                    </UButton>
                    <UInput placeholder="filter clubs..." />
                </div>
            </div>
            <div>
                <UCard>

                </UCard>
            </div>
        </div>
        <UModal v-model="isOpen">
            <UCard>
                <template #header>
                    <h1 class="text-primary font-semibold text-xl capitalize">Add new club</h1>
                </template>

                <UForm :state="state" @submit="submit">
                    <UFormGroup label="Club logo " class="mb-4">

                        <label for="club"
                            class="border border-primary w-max flex items-center justify-center gap-2 py-2 px-4 rounded-[8px]">
                            <UIcon name="i-ant-design-upload-outlined" dynamic />
                            Upload
                        </label>
                        <input type="file" id="club" ref="inputFile" class="hidden" accept=".jpg, .png, .jpeg"
                            @change="uploadFile" />
                    </UFormGroup>
                    <UFormGroup label="Club name" class="mb-4">
                        <UInput placeholder="Club name" />
                    </UFormGroup>
                    <div class="w-[150px] mb-4">
                        <img ref="imagePreview" class="w-full h-full" />
                    </div>
                    <UButton type="submit">Add</UButton>
                </UForm>
            </UCard>
        </UModal>
    </section>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'admin'
})
const isOpen = ref(true)
const inputFile = ref<HTMLInputElement | null>()
const imagePreview = ref<HTMLImageElement | null>()

const state = reactive({})

const submit = () => {
    if (inputFile.value?.files !== null) {
        console.log(inputFile.value!.files[0])

    }
}
const uploadFile: (payload: Event) => void = (payload) => {

    imagePreview.value!.src = URL.createObjectURL(payload.target?.files[0])

}
</script>

<style scoped></style>