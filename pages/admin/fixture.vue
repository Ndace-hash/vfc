<template>
    <section>

        <UModal v-model="isOpen">
            <UCard>
                <template #header>
                    <h1 class="text-primary text-2xl font-bold">Fixtures</h1>
                </template>
                <template #default>
                    <UForm :state="state" @submit="addFixture">
                        <UFormGroup label="Venue" class="mb-4">
                            <div class="flex gap-6 my-2">
                                <URadio v-for="option in options" :key="option.value" v-model="state.venue"
                                    v-bind="option" />

                            </div>
                        </UFormGroup>
                        <UFormGroup label="Oponent" class="mb-4">
                            <UInputMenu :options="clubs" by="name" option-attribute="name" v-model="state.oponent">
                                <template #option="{ option: club }">
                                    <div class="flex items-center gap-4">
                                        <div class="w-16">
                                            <img :src="club.logo" :alt="club.name" class="w-full h-full">
                                        </div>
                                        <span>{{ club.name }}</span>
                                    </div>

                                </template>
                            </UInputMenu>
                        </UFormGroup>
                        <UFormGroup label="Match Day" class="mb-4">
                            <DatePicker mode="dateTime" v-model="state.date" />
                        </UFormGroup>
                        <UFormGroup class="flex justify-end">
                            <UButton label="Add" type="submit" class="px-8" size="lg" />
                        </UFormGroup>
                    </UForm>
                </template>
            </UCard>
        </UModal>
    </section>
</template>

<script setup lang="ts">
import { fireStore } from '~/config/firebase'
import { collection, getDocs } from 'firebase/firestore'
import { DatePicker } from 'v-calendar'
definePageMeta({
    layout: 'admin'
})
const isOpen = ref(true)
const state = reactive({
    venue: '',
    date: new Date(),
    oponent: {}
})
const clubs = ref<any>([])
const options = [{
    label: 'Home',
    value: 'home'
}, { label: 'Away', value: 'away' }]

const addFixture = () => {
    console.log(state)
}

onBeforeMount(() => {
    getDocs(collection(fireStore, 'clubs')).then((snapshot) => {
        snapshot.docs.forEach(doc => {
            const data = doc.data()
            clubs.value.push({ id: doc.id, name: data.name, logo: data.logo })
        })
    })
})
</script>

<style scoped></style>