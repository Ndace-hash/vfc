<template>
    <section>
        <h1 class="text-white capitalize text-2xl max-w-[1024px] mx-auto my-6">Team <span
                class="font-semibold">Management</span></h1>

        <div
            class="bg-white max-w-[1024px] h-full max-h-[600px] mx-auto rounded-[8px] shadow-lg my-10 overflow-y-hidden">
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
                        <IconRefresh width="15px"
                            :class="isRefreshing ? 'duration-1000 ease-linear animate-spin' : ''" />
                        Refresh
                    </UButton>
                    <UInput v-model="q" placeholder="filter players..." />
                </div>
            </div>
            <div class="h-[500px] overflow-y-scroll">
                <UTable :data="filteredRows" :columns="columns">
                    <template #actions-cell="{ row }">
                        <UDropdownMenu :items="items(row.original)">
                            <UButton color="neutral" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
                        </UDropdownMenu>
                    </template>
                    <template #empty>
                        <div class="flex flex-col items-center gap-2 py-6">
                            <UIcon name="i-heroicons-circle-stack-20-solid" class="text-2xl" />
                            <span>No players.</span>
                        </div>
                    </template>
                </UTable>

                <UModal v-model:open="editPlayerModal" title="Edit a player"
                    description="Fill out the form to edit player information."
                    :ui="{ title: 'text-primary font-bold text-xl mb-2', description: 'text-sm text-admin-dark' }">
                    <template #body>
                        <UForm :state="playerToEdit" @submit="updatePlayerInfo" :schema="schema">
                            <div class="w-[150px] mb-4">
                                <img ref="imagePreview" class="w-full h-full" :src="playerToEdit.photoURL" />
                            </div>

                            <UFormField label="Player Image " class="mb-4" required>

                                <label for="club"
                                    class="border border-primary w-max flex items-center justify-center gap-2 py-2 px-4 rounded-[8px]">
                                    <UIcon name="i-ant-design-upload-outlined" />
                                    Player Photo
                                </label>
                                <input type="file" id="club" ref="inputFile" class="opacity-0"
                                    accept=".jpg, .png, .jpeg" @change="previewFile" />
                            </UFormField>

                            <div class="flex items-center gap-4 mb-3">

                                <UFormField label="First Name" class="w-1/2" name="firstName" required>
                                    <UInput v-model="playerToEdit.firstName" />
                                </UFormField>
                                <UFormField label="Last Name" class="w-1/2" name="lastName" required>
                                    <UInput v-model="playerToEdit.lastName" />
                                </UFormField>
                            </div>
                            <div class="flex items-center gap-4 mb-3">

                                <UFormField label="Position" name="position" required>
                                    <USelect v-model="playerToEdit.position"
                                        :items="['Goalkeeper', 'Defender', 'MidFielder', 'Forward']" />
                                </UFormField>
                                <UFormField label="Jersey Number" name="number" required>
                                    <UInput v-model="playerToEdit.number" />
                                </UFormField>
                                <UFormField label="Gender" name="gender" required>
                                    <USelect v-model="playerToEdit.gender" :items="['Male', 'Female']" />
                                </UFormField>
                            </div>
                            <UFormField label="Date Of Birth" class="mb-3" name="DoB" required>
                                <DatePicker v-model="playerToEdit.DoB" mode="date" />
                            </UFormField>
                            <UFormField label="State of Origin" name="stateOforigin" required>
                                <UInputMenu v-model="playerToEdit.stateOfOrigin" :items="States" />
                            </UFormField>

                            <UButton type="submit" :loading="isLoading" class="mt-6 px-6">Edit</UButton>
                        </UForm>
                    </template>
                </UModal>
            </div>
        </div>
        <UModal v-model:open="isOpen" title="Add a new player" description="Fill out the form to add a new player"
            :ui="{ title: 'text-primary font-bold text-xl mb-2', description: 'text-sm text-admin-dark' }">
            <template #body>
                <UForm :state="state" :schema="schema" @submit="addPlayer">
                    <div class="w-[150px] mb-4" v-show="!hidePreview">
                        <img ref="imagePreview" class="w-full h-full" />
                    </div>

                    <UFormField label="Player Image " class="mb-4" required>

                        <label for="club"
                            class="border border-primary w-max flex items-center justify-center gap-2 py-2 px-4 rounded-[8px]">
                            <UIcon name="i-ant-design-upload-outlined" />
                            Player Photo
                        </label>
                        <input type="file" id="club" ref="inputFile" class="opacity-0" accept=".jpg, .png, .jpeg"
                            @change="previewFile" required />
                    </UFormField>

                    <div class="flex items-center gap-4 mb-3">

                        <UFormField label="First Name" class="w-1/2" name="firstName" required>
                            <UInput v-model="state.firstName" />
                        </UFormField>
                        <UFormField label="Last Name" class="w-1/2" name="lastName" required>
                            <UInput v-model="state.lastName" />
                        </UFormField>
                    </div>
                    <div class="flex items-center gap-4 mb-3">

                        <UFormField label="Position" name="position" required>
                            <USelect v-model="state.position"
                                :items="['Goalkeeper', 'Defender', 'MidFielder', 'Forward']" />
                        </UFormField>
                        <UFormField label="Jersey Number" name="number" required>
                            <UInput v-model="state.number" />
                        </UFormField>
                        <UFormField label="Gender" name="gender" required>
                            <USelect v-model="state.gender" :items="['Male', 'Female']" />
                        </UFormField>
                    </div>
                    <UFormField label="Date Of Birth" class="mb-3" name="DoB" required>
                        <DatePicker v-model="state.DoB" mode="date" />
                    </UFormField>
                    <UFormField label="State of Origin" name="state" required>
                        <UInputMenu v-model="state.stateOfOrigin" :items="States" />
                    </UFormField>

                    <UButton type="submit" :loading="isLoading" size="sm" class="mt-6 px-6" color="primary">Add
                    </UButton>
                </UForm>
            </template>
        </UModal>

    </section>
</template>

<script setup lang="ts">
import { DatePicker } from 'v-calendar'
// import { fireStore, storage } from '~/config/firebase'
import { getDocs, addDoc, collection, deleteDoc, doc, setDoc, Timestamp } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { timestampToDate } from '~/composables/useTimestamp'
import { type FirebaseState } from '~/types/Firebase'

definePageMeta({
    layout: 'admin'
})
const isLoading = ref(false)
const isOpen = ref(false)
const players = ref<any>([])
const inputFile = ref<HTMLInputElement | null>()
const editPlayerModal = ref(false)

const firebase = useState<FirebaseState>('firebase')

const state = reactive({
    firstName: undefined,
    lastName: undefined,
    photoURL: undefined,
    position: undefined,
    number: undefined,
    DoB: new Date(),
    stateOfOrigin: undefined,
    gender: undefined

})


const schema = z.object({
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1),
    position: z.string().trim().min(1),
    number: z.string().trim().min(1),
    stateOfOrigin: z.string(),
    DoB: z.date(),
    gender: z.string()

})

type Schema = z.output<typeof schema>
const playerToEdit = ref()
const items = (row: any) => [
    [{
        label: 'Edit',
        icon: 'i-heroicons-pencil-square-20-solid',
        onSelect: () => {

            players.value.forEach((player: any) => {
                if (row.id == player.id) playerToEdit.value = { ...player, DoB: timestampToDate(player.DoB) }
            })
            editPlayerModal.value = true
            console.log(playerToEdit.value)
        }
    }, {
        label: 'Delete',
        icon: 'i-heroicons-trash-20-solid',
        onSelect: () => {
            try {
                if (confirm(`Are you sure you want to delete ${row.first_name} ${row.last_name}?`)) {
                    deleteDoc(doc(firebase.value.fireStore, 'players', row.id))
                    players.value = players.value.filter((player: any) => player.id !== row.id)
                }

            } catch (error) {
                console.log(error)
                return error
            }
        }
    }]
]

const columns = [{
    accessorKey: 'firstName',
    header: 'First Name'
}, {
    accessorKey: 'lastName',
    header: 'Last Name'
},
{
    accessorKey: 'position',
    header: 'Position'
}, {
    accessorKey: 'number',
    header: 'Jersey'
},
{
    accessorKey: 'gender',
    header: 'Gender'
},
{ id: 'actions' }]

const collectionRef = collection(firebase.value.fireStore, 'players')
// const Months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const States = ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara']
async function addPlayer(event: FormSubmitEvent<Schema>) {
    try {
        isLoading.value = true
        const data = {

            firstName: state.firstName,
            lastName: state.lastName,
            photoURL: '',
            position: state.position,
            number: state.number,
            DoB: state.DoB,
            stateOfOrigin: state.stateOfOrigin,
            gender: state.gender
        }
        const fileName = `${state.firstName}_${state.lastName}.png`
        if (inputFile.value?.files !== null) {
            const clubRef = storageRef(firebase.value.storage, `players/${fileName}`)

            await uploadBytes(clubRef, inputFile.value!.files[0]).then((snapshot: any) => {
                getDownloadURL(snapshot.ref).then((url) => {
                    data.photoURL = url
                }).then(() => {
                    addDoc(collectionRef, data)

                })
            }).then(() => {
                inputFile.value!.files = null
                hidePreview.value = true
                imagePreview.value!.src = ''
                state.DoB = new Date()
                state.firstName = undefined
                state.lastName = undefined
                state.gender = undefined
                state.number = undefined
                state.position = undefined
                state.stateOfOrigin = undefined
                state.photoURL = undefined
                isLoading.value = false
            })

        }
        isLoading.value = false
        isOpen.value = false
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
                ...data
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

    return players.value.filter(player => {
        return Object.values(player).some((value) => {
            return String(value).toLowerCase().includes(q.value.toLowerCase())
        })
    })
})
const isRefreshing = ref(false)
const imagePreview = ref<HTMLImageElement | null>()
const hidePreview = ref(true)
const previewFile: (payload: Event) => void = (payload) => {

    imagePreview.value!.src = URL.createObjectURL(payload.target?.files[0])
    hidePreview.value = false

}
const refreshTable = async () => {
    try {
        players.value = []
        isRefreshing.value = true
        const snapshot = await getDocs(collectionRef)
        snapshot.docs.forEach((doc) => {

            const data = doc.data()
            players.value.push({
                id: doc.id,
                ...data
            }
            )
        })
        console.log('success')
        isRefreshing.value = false

    } catch (e) {
        console.log(e)
    }
}

async function updatePlayerInfo(event: FormSubmitEvent<Schema>) {
    try {
        isLoading.value = true
        const data = {

            firstName: playerToEdit.value.firstName,
            lastName: playerToEdit.value.lastName,
            photoURL: playerToEdit.value.photoURL,
            position: playerToEdit.value.position,
            number: playerToEdit.value.number,
            DoB: Timestamp.fromDate(playerToEdit.value.DoB),
            stateOfOrigin: playerToEdit.value.stateOfOrigin,
            gender: playerToEdit.value.gender
        }
        const fileName = `${playerToEdit.value.firstName}_${playerToEdit.value.lastName}.png`
        if (inputFile.value?.files !== null) {
            const clubRef = storageRef(firebase.value.storage, `players/${fileName}`)

            await uploadBytes(clubRef, inputFile.value!.files[0]).then((snapshot: any) => {
                getDownloadURL(snapshot.ref).then((url) => {
                    data.photoURL = url
                }).then(() => {
                    setDoc(doc(collectionRef, playerToEdit.value.id), data)

                })
            }).then(() => {
                inputFile.value!.files = null
                hidePreview.value = true
                imagePreview.value!.src = ''
                state.DoB = new Date()
                state.firstName = undefined
                state.lastName = undefined
                state.gender = undefined
                state.number = undefined
                state.position = undefined
                state.stateOfOrigin = undefined
                state.photoURL = undefined
                isLoading.value = false
            })

        }
        isLoading.value = false
        editPlayerModal.value = false
    } catch (e) {

        isLoading.value = false
        console.log(e)
    }
}

</script>

<style scoped></style>