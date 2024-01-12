<template>
    <section>
        <h1 class="text-white capitalize text-2xl max-w-[1024px] mx-auto my-6">Team <span
                class="font-semibold">Management</span></h1>

        <div class="bg-white max-w-[1024px] h-full max-h-[600px] mx-auto rounded-[8px] shadow-lg my-10 overflow-y-hidden">
            <div class="flex items-center py-4 px-4 justify-between border-b border-admin-light">
                <button
                    class="flex border-2 border-primary items-center justify-center gap-1  text-admin-dark font-semibold py-2 px-4 rounded-full md:hover:shadow-md duration-200 ease-in ">
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
    </section>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'admin'
})
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
</script>

<style scoped></style>