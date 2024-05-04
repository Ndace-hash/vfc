<template>

    <Head>
        <Title>Fixtures | Valiant FC</Title>
    </Head>
    <section>
        <div>
            <h1 class="text-white capitalize text-2xl max-w-[1024px] mx-auto my-6">Fixtures</h1>
            <div
                class="bg-white max-w-[1024px] h-full max-h-[600px] mx-auto rounded-[8px] shadow-lg my-10 overflow-y-auto">
                <div class="flex items-center py-4 px-4 justify-between border-b border-admin-light">
                    <button
                        class="flex bg-primary text-white border-2 border-primary items-center justify-center gap-1   font-semibold py-2 px-4 rounded-full md:hover:shadow-md duration-200 ease-in "
                        @click="isOpen = true">
                        <span>Add Fixtures</span>
                        <IconPlus width="30px" color="#ffffff" />
                    </button>
                    <div class="flex gap-2 items-center">
                        <UButton @click="refresh"
                            class="bg-transparent text-admin-dark flex items-center border-2 border-primary hover:text-white"
                            :disabled="isRefreshing">
                            <IconRefresh width="15px"
                                :class="isRefreshing ? 'duration-1000 ease-linear animate-spin' : ''" />
                            Refresh
                        </UButton>
                    </div>
                </div>
                <AdminFixtureCard v-for="fixture in fixtures" :key="fixture.id" :fixture="fixture"
                    @edit-fixture="openEditModal" />
            </div>

        </div>

        <UModal v-model="isOpen">
            <UCard>
                <template #header>
                    <h1 class="text-primary text-2xl font-bold">Fixtures</h1>
                </template>
                <template #default>
                    <UForm :state="state" @submit="addFixture" :schema="schema">
                        <UFormGroup label="Venue" class="mb-4" name="venue">
                            <div class="flex gap-6 my-2">
                                <URadio v-for="option in options" :key="option.value" v-model="state.venue"
                                    v-bind="option" />

                            </div>
                        </UFormGroup>
                        <UFormGroup label="Oponent" class="mb-4" name="opponent">
                            <UInputMenu :options="clubs" by="name" option-attribute="name" v-model="state.opponent">
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
                        <UFormGroup label="Season" class="mb-4" name="season">
                            <UInput placeholder="Ex. 2023/2024" v-model="state.season" />
                        </UFormGroup>
                        <UFormGroup label="Match Day" class="mb-4 flex items-center flex-col" name="date">
                            <DatePicker mode="dateTime" v-model="state.date" />
                        </UFormGroup>
                        <UFormGroup class="flex justify-end">
                            <UButton label="Add" type="submit" class="px-8" size="lg" />
                        </UFormGroup>
                    </UForm>
                </template>
            </UCard>
        </UModal>
        <UModal v-model="editModalIsOpen">
            <UCard>
                <template #header>
                    <h1 class="text-primary text-2xl font-bold">Fixtures</h1>
                </template>
                <template #default>
                    <div class="flex flex-col items-center">
                        <div class="flex items-center gap-3">
                            <div class="w-[100px]">
                                <img :src="fixtureToEdit.home.logo" :alt="fixtureToEdit.home.name"
                                    class="w-full h-full">
                            </div>
                            <span class="font-bold text-lg">VS</span>
                            <div class="w-[100px]">
                                <img :src="fixtureToEdit.away.logo" :alt="fixtureToEdit.away.name"
                                    class="w-full h-full">
                            </div>
                        </div>
                        <UForm :state="fixtureToEdit" @submit="updateFixture(fixtureToEdit.id)">
                            <UCheckbox label="Match Played" class="mb-4" v-model="fixtureToEdit.played" />
                            <UFormGroup label="Scores" class="mb-6 flex flex-col items-center">
                                <div class="flex items-center gap-4">
                                    <UInput v-model="fixtureToEdit.goals.home" class="w-10 font-bold text-2xl"
                                        size="sm" />
                                    <span class="text-xl font-bold">--</span>
                                    <UInput v-model="fixtureToEdit.goals.away" class="w-10 font-bold text-2xl"
                                        size="sm" />
                                </div>
                            </UFormGroup>
                            <UFormGroup label="Match day" class="mb-4">
                                <DatePicker v-model="fixtureToEdit.date" mode="dateTime" />
                            </UFormGroup>
                            <UFormGroup class="flex justify-end">
                                <UButton label="Update" type="submit" class="px-8" size="lg" />
                            </UFormGroup>
                        </UForm>
                    </div>
                </template>
            </UCard>
        </UModal>
    </section>
</template>

<script setup lang="ts">
import { type FirebaseState } from '~/types/Firebase'
import { collection, getDocs, addDoc, doc, setDoc, Timestamp } from 'firebase/firestore'
import { DatePicker } from 'v-calendar'
import { z } from 'zod'
definePageMeta({
    layout: 'admin'
})
const valiant = useState('valiant')
const firebase = useState<FirebaseState>('firebase')
const isOpen = ref(false)
const isRefreshing = ref(false)
const state = reactive({
    venue: '',
    date: new Date(),
    opponent: { id: '', logo: '', name: '' },
    season: ''
})
const schema = z.object({
    venue: z.string(),
    date: z.date()

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
        date: Timestamp.fromDate(state.date)
    })
    if (state.venue == 'home') {
        fixture.value.away = state.opponent
        fixture.value.home = valiant.value
    } else if (state.venue == 'away') {
        fixture.value.home = state.opponent
        fixture.value.away = valiant.value

    }
    try {
        console.log(fixture.value);

        addDoc(collection(firebase.value.fireStore, 'fixtures'), fixture.value).then((snapshot) => {
            console.log(snapshot)
        })
        state.venue = ''
        state.season = ""
        state.opponent.id = ""
        state.opponent.logo = ""
        state.opponent.name = ""
    } catch (e) {
        console.error(e)
    }
}

const editModalIsOpen = ref(false)
const fixtureToEdit = ref()

const fixtureColRef = collection(firebase.value.fireStore, 'fixtures')

const refresh = () => {
    isRefreshing.value = true
    try {
        clubs.value = []
        getDocs(fixtureColRef).then(snapshot => {
            snapshot.docs.forEach(doc => {
                const data = doc.data()
                clubs.value.push({ id: doc.id, ...data })
            })
        })
        isRefreshing.value = false
    } catch (e) {
        isRefreshing.value = false
        console.log(e)
    }
}


onBeforeMount(() => {
    getDocs(collection(firebase.value.fireStore, 'clubs')).then((snapshot) => {
        snapshot.docs.forEach(doc => {
            const data = doc.data()
            clubs.value.push({ id: doc.id, name: data.name, logo: data.logo })
        })
    })

    getDocs(collection(firebase.value.fireStore, 'fixtures')).then((snapshot) => {
        snapshot.docs.forEach((doc) => {
            const data = doc.data()
            fixtures.value.push({ id: doc.id, ...data })
        })
    })
})

const openEditModal = (id: anydey) => {
    editModalIsOpen.value = true
    fixtureToEdit.value = fixtures.value.map((f: any) => ({
        ...f,
        date: f.date.toDate()
    })).find((fixture: any) => fixture.id === id)
}
const isLoading = ref(false)
const updateFixture = (id: string) => {
    isLoading.value = true;
    try {
        setDoc(doc(firebase.value.fireStore, 'fixtures', id), fixtureToEdit.value).then((snapshot) => {
            console.log(snapshot)
        })
        isLoading.value = false
    } catch (e) {
        isLoading.value = false
        console.error(e)
    }
}
</script>

<style scoped></style>