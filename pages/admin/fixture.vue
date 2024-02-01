<template>
    <section>
        <div>
            <h1 class="text-white capitalize text-2xl max-w-[1024px] mx-auto my-6">Fixtures</h1>
            <div
                class="bg-white max-w-[1024px] h-full max-h-[600px] mx-auto rounded-[8px] shadow-lg my-10 overflow-y-hidden">
                <div class="flex items-center py-4 px-4 justify-between border-b border-admin-light">
                    <button
                        class="flex bg-primary text-white border-2 border-primary items-center justify-center gap-1   font-semibold py-2 px-4 rounded-full md:hover:shadow-md duration-200 ease-in "
                        @click="isOpen = true">
                        <span>Add Fixtures</span>
                        <IconPlus width="30px" color="#ffffff" />
                    </button>
                    <div class="flex gap-2 items-center">
                        <UButton
                            class="bg-transparent text-admin-dark flex items-center border-2 border-primary hover:text-white"
                            :disabled="isRefreshing">
                            <IconRefresh width="15px"
                                :class="isRefreshing ? 'duration-1000 ease-linear animate-spin' : ''" />
                            Refresh
                        </UButton>
                    </div>
                </div>
                <AdminFixtureCard v-for="fixture in fixtures" :key="fixture.id" :fixture="fixture" />
            </div>

        </div>

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
                        <UFormGroup label="Season" class="mb-4">
                            <UInput placeholder="Ex. 2023/2024" v-model="state.season" />
                        </UFormGroup>
                        <UFormGroup label="Match Day" class="mb-4 flex items-center flex-col">
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
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { DatePicker } from 'v-calendar'
definePageMeta({
    layout: 'admin'
})
const valiant = useState('valiant')
const isOpen = ref(false)
const isRefreshing = ref(false)
const state = reactive({
    venue: '',
    date: new Date(),
    oponent: { id: '', logo: '', name: '' },
    season: ''
})
const clubs = ref<any>([])
const fixtures = ref<any>([])
const options = [{
    label: 'Home',
    value: 'home'
}, { label: 'Away', value: 'away' }]
const addFixture = () => {
    const fixture = ref({
        home: {
            id: '',
            logo: '',
            name: ''
        },
        away: {
            id: '',
            logo: '',
            name: ''
        },
        season: state.season.trim().replace('/', '_'), played: false,
        goals: {
            home: 0,
            away: 0,
        },
        date: state.date
    })
    if (state.venue == 'home') {
        fixture.value.away = state.oponent
        fixture.value.home = valiant.value
    } else if (state.venue == 'away') {
        fixture.value.home = state.oponent
        fixture.value.away = valiant.value

    }
    try {
        addDoc(collection(fireStore, 'fixtures'), fixture.value).then((snapshot) => {
            console.log(snapshot)
        })
    } catch (e) {
        console.error(e)
    }
}

onBeforeMount(() => {
    getDocs(collection(fireStore, 'clubs')).then((snapshot) => {
        snapshot.docs.forEach(doc => {
            const data = doc.data()
            clubs.value.push({ id: doc.id, name: data.name, logo: data.logo })
        })
    })

    getDocs(collection(fireStore, 'fixtures')).then((snapshot) => {
        snapshot.docs.forEach((doc) => {
            const data = doc.data()
            fixtures.value.push({ id: doc.id, ...data })
        })
    })
})
</script>

<style scoped></style>