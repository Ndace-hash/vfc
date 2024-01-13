<template>
    <section>
        <h1 class="text-white capitalize text-2xl max-w-[1024px] mx-auto my-6">Team <span
                class="font-semibold">Management</span></h1>

        <div class="bg-white max-w-[1024px] h-full max-h-[600px] mx-auto rounded-[8px] shadow-lg my-10 overflow-y-hidden">
            <div class="flex items-center py-4 px-4 justify-between border-b border-admin-light">
                <button
                    class="flex border-2 border-primary items-center justify-center gap-1  text-admin-dark font-semibold py-2 px-4 rounded-full md:hover:shadow-md duration-200 ease-in "
                    @click="isOpen = true">
                    <span>Add player</span>
                    <IconPlus width="30px" color="#9EB0A2" />
                </button>
                <div class="">
                    <div class="">
                        Search Player
                    </div>
                </div>
            </div>
            <div class="h-[500px] overflow-y-scroll">
                <UTable v-model="selected" :rows="players"
                    :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'No players.' }" />
            </div>
        </div>
        <UModal v-model="isOpen">
            <UCard>
                <template #header>
                    <h2 class="text-primary font-bold text-xl mb-2">Add a new player</h2>
                    <p class="text-sm text-admin-dark">Fill out the form to add a new player</p>
                </template>
                <UForm :state="state">
                    <div class="flex items-center gap-4 mb-3">

                        <UFormGroup label="First Name" class="w-1/2">
                            <UInput v-model="state.name.first" />
                        </UFormGroup>
                        <UFormGroup label="Last Name" class="w-1/2">
                            <UInput v-model="state.name.last" />
                        </UFormGroup>
                    </div>
                    <div class="flex items-center gap-4 mb-3">

                        <UFormGroup label="Position">
                            <USelect v-model="state.position"
                                :options="['Goalkeeper', 'Defender', 'MidFielder', 'Forward']" />
                        </UFormGroup>
                        <UFormGroup label="Jersey Number">
                            <UInput v-model="state.number" />
                        </UFormGroup>
                    </div>
                    <UFormGroup label="Date Of Birth" class="mb-3">

                        <div class="flex gap-2">
                            <UInput v-model="state.DoB.day" class="w-12 text-center" />
                            <USelect v-model="state.DoB.month" :options="Months" class="w-1/4" />
                            <UInput v-model="state.DoB.year" class="w-1/4" />
                        </div>
                    </UFormGroup>
                    <UFormGroup label="State of Origin">
                        <UInput v-model="state.stateOfOrigin" />
                    </UFormGroup>

                </UForm>
                <template #footer>
                    <UButton type="submit">Add</UButton>
                </template>
            </UCard>
        </UModal>
    </section>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'admin'
})
const isOpen = ref(false)
const selected = ref([])
const players = [{
    id: 1,
    name: 'Lindsay Walton',
    title: 'Front-end Developer',
    email: 'lindsay.walton@example.com',
    role: 'Member'
}, {
    id: 2,
    name: 'Courtney Henry',
    title: 'Designer',
    email: 'courtney.henry@example.com',
    role: 'Admin'
},
{
    id: 3,
    name: 'Tom Cook',
    title: 'Director of Product',
    email: 'tom.cook@example.com',
    role: 'Member'
}, {
    id: 4,
    name: 'Whitney Francis',
    title: 'Copywriter',
    email: 'whitney.francis@example.com',
    role: 'Admin'
}, {
    id: 5,
    name: 'Leonard Krasner',
    title: 'Senior Designer',
    email: 'leonard.krasner@example.com',
    role: 'Owner'
}, {
    id: 6,
    name: 'Floyd Miles',
    title: 'Principal Designer',
    email: 'floyd.miles@example.com',
    role: 'Member'
}]

const state = reactive({
    name: {
        first: '',
        last: ''
    },
    position: '',
    number: undefined,
    DoB: {
        day: '1',
        month: 'October',
        year: '1960'
    },
    stateOfOrigin: ''

})
const Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
</script>

<style scoped></style>