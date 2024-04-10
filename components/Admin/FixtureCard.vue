<template>
    <UCard class="relative">
        <h5 class="text-primary font-semibold text-lg text-center">{{ `${dayMasks[date[0]]} ${date[1]} ${date[2]},
            ${date[3]}.` }}</h5>
        <div class="flex justify-center items-center gap-5">
            <div class="flex items-center gap-2">
                <div class="flex flex-col items-center">

                    <div class="w-[150px] flex flex-col items-center overflow-hidden">
                        <img :src="fixture.home.logo" :alt="fixture.home.name" class="w-full h-full" />
                    </div>
                    <span class="font-semibold">{{ fixture.home.name }}</span>
                </div>
                <span class="text-5xl font-bold">{{ fixture.goals.home }}</span>
            </div>
            <p.>VS</p.>
            <div class="flex items-center">
                <div class="flex items-center gap-2">
                    <span class="text-5xl font-bold">{{ fixture.goals.away }}</span>
                    <div class="flex flex-col items-center">
                        <div class="w-[150px] flex flex-col items-center overflow-hidden">
                            <img :src="fixture.away.logo" :alt="fixture.away.name" class="w-full h-full" />
                        </div>
                        <span class="font-semibold">{{ fixture.away.name }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="absolute top-4 right-4 flex gap-2">

            <UButton variant="outline" size="xs" @click="$emit('editFixture', fixture.id)">
                <template #leading>
                    <UIcon name="i-material-symbols-edit" dynamic class="text-lg" />
                </template>
                <template #default>
                    <span class="text-primary text-sm">Edit</span>
                </template>
            </UButton>
            <UButton variant="solid" color="red" size="xs" @click="deleteFixture(fixture.id)">
                <template #leading>
                    <UIcon name="i-ph-trash" dynamic class="text-lg" />
                </template>
                <template #default>
                    <span class="text-white text-sm">Delete</span>
                </template>
            </UButton>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import { doc, deleteDoc } from 'firebase/firestore'
// import { fireStore } from '~/config/firebase'
import { type FirebaseState } from '~/types/Firebase'
const props = defineProps(['fixture'])
const emits = defineEmits(['editFixture'])
const firebase = useState<FirebaseState>('firebase')
const dateFormat = props.fixture.date.toDate()
const date = ref<string[]>(dateFormat.toString().split(' '))
const dayMasks = {
    'Sun': 'Sunday',
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday'
}

const openEditModal = ref(false)
const deleteFixture = (id: string) => {
    const deleteConfirmed = confirm(`Are sure you want to delete ${props.fixture.home.name} vs ${props.fixture.away.name}?`)
    if (deleteConfirmed) {

        try {

            deleteDoc(doc(firebase.value.fireStore, 'fixtures', id))
        } catch (e) {
            console.error(e)
        }
    }
}
</script>

<style scoped></style>