<template>
    <section>
        <h1 class="text-white capitalize text-2xl max-w-[1024px] mx-auto my-6">Team <span
                class="font-semibold">Management</span></h1>

        <div class="bg-white max-w-[1024px] h-full max-h-[600px] mx-auto rounded-[8px] shadow-lg my-10 overflow-y-hidden">
            <div class="flex items-center py-4 px-4 justify-between border-b border-admin-light">
                <button
                    class="flex bg-primary text-white border-2 border-primary items-center justify-center gap-1 font-semibold py-2 px-4 rounded-full md:hover:shadow-md duration-200 ease-in "
                    @click="isOpen = true">
                    <span>Add player</span>
                    <IconPlus width="30px" color="#ffffff" />
                </button>
                <div class="flex gap-2 items-center">
                    <UButton
                        class="bg-transparent text-admin-dark flex items-center border-2 border-primary hover:text-white"
                        @click="refreshTable" :disabled="isRefreshing">
                        <IconRefresh width="15px" :class="isRefreshing ? 'duration-1000 ease-linear animate-spin' : ''" />
                        Refresh
                    </UButton>
                    <UInput v-model="q" placeholder="filter players..." />
                </div>
            </div>
            <div class="h-[500px] overflow-y-scroll">
                <UTable v-model="selected" :rows="filteredRows"
                    :empty-state="{ icon: 'i-heroicons-circle-stack-20-solid', label: 'No players.' }" />
            </div>
        </div>
        <UModal v-model="isOpen">
            <UCard>
                <template #header>
                    <h2 class="text-primary font-bold text-xl mb-2">Add a new player</h2>
                    <p class="text-sm text-admin-dark">Fill out the form to add a new player</p>
                </template>
                <UForm :state="state" @submit="addPlayer">
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
                        <UFormGroup label="Gender">
                            <USelect v-model="state.gender" :options="['Male', 'Female']" />
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
                        <UInputMenu v-model="state.stateOfOrigin" :options="States" />
                    </UFormGroup>

                    <UButton type="submit" :loading="isLoading" class="mt-6 px-6">Add</UButton>
                </UForm>
            </UCard>
        </UModal>

    </section>
</template>

<script setup lang="ts">
import { fireStore } from '~/config/firebase'
import { getDocs, addDoc, collection } from 'firebase/firestore'
import type { Player } from '~/types/Player';
definePageMeta({
    layout: 'admin'
})
const addPlayerForm = ref<HTMLFormElement | null>(null)
const isLoading = ref(false)
const isOpen = ref(false)
const selected = ref([])
const players = ref<Player[]>([])


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
    stateOfOrigin: '',
    gender: ''

})
const collectionRef = collection(fireStore, 'players')
const Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const States = ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara']
const addPlayer = async () => {
    try {
        isLoading.value = true
        const docRef = await addDoc(collectionRef, state)
        console.log(docRef)
        isLoading.value = false
        state.DoB.day = '1'
        state.DoB.month = 'October'
        state.DoB.year = '1960'
        state.name.first = ''
        state.name.last = ''
        state.gender = ''
        state.number = undefined
        state.position = ''
        state.stateOfOrigin = ''
    } catch (e) {
        isLoading.value = false
        console.log(e)
    }
}
onBeforeMount(async () => {
    try {
        const snapshot = await getDocs(collectionRef)

        snapshot.docs.forEach((doc) => {
            const data = doc.data()

            players.value.push({
                id: doc.id,
                first_name: String(data.name.first),
                last_name: String(data.name.last),
                gender: String(data.gender),
                postion: String(data.position),
                number: Number(data.number),
                state_of_origin: String(data.stateOfOrigin),
                date_of_birth: `${data.DoB.day} ${data.DoB.month}, ${data.DoB.year}`
            }
            )
        })
    } catch (e) {
        console.log(e)
    }
})

const q = ref('')

const filteredRows = computed(() => {
    if (!q.value) {
        return players.value
    }

    return players.value.filter((player) => {
        return Object.values(player).some((value) => {
            return String(value).toLowerCase().includes(q.value.toLowerCase())
        })
    })
})
const isRefreshing = ref(false)
const refreshTable = async () => {
    try {
        players.value = []
        isRefreshing.value = true
        const snapshot = await getDocs(collectionRef)
        snapshot.docs.forEach((doc) => {

            const data = doc.data()
            players.value.push({
                id: doc.id,
                first_name: String(data.name.first),
                last_name: String(data.name.last),
                gender: String(data.gender),
                postion: String(data.position),
                number: Number(data.number),
                state_of_origin: String(data.stateOfOrigin),
                date_of_birth: `${data.DoB.day} ${data.DoB.month}, ${data.DoB.year}`
            }
            )
        })
        console.log('success')
        isRefreshing.value = false

    } catch (e) {
        console.log(e)
    }
}
</script>

<style scoped></style>