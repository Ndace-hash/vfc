<template>
    <UCard>
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
    </UCard>
</template>

<script setup lang="ts">
const props = defineProps(['fixture'])
const dateFormat = props.fixture.date.toDate()
const date = ref(dateFormat.toString().split(' '))
const dayMasks = {
    'Sun': 'Sunday',
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday'
}
</script>

<style scoped></style>