<template>
    <PlayerDisplay position="Goalkeepers" :player-list="goalkeepers" />
    <PlayerDisplay position="Defenders" :player-list="defenders" />
    <PlayerDisplay position="Mid Fielders" :player-list="midfielders" />
    <PlayerDisplay position="Forwards" :player-list="forwards" />
</template>

<script setup lang="ts">
import { fireStore } from '~/config/firebase'
import { getDocs, collection } from 'firebase/firestore'
import type { Player } from '~/types/Player';

const players = ref<Player[]>([])
const collectionRef = collection(fireStore, 'players')
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
                position: String(data.position),
                number: Number(data.number),
                state_of_origin: String(data.stateOfOrigin),
                date_of_birth: `${data.DoB.day} ${data.DoB.month}, ${data.DoB.year}`,
                photoURL: String(data.photoURL)
            }
            )
        })
    } catch (e) {
        console.log(e)
    }
})

const seperatePlayersByPosition = (position: string) => {
    return computed(() => {
        return players.value.filter(player => player.position.toLowerCase() === position)
    })
}

const goalkeepers = seperatePlayersByPosition('goalkeeper')
const defenders = seperatePlayersByPosition('defender')
const midfielders = seperatePlayersByPosition('midfielder')
const forwards = seperatePlayersByPosition('forward')

</script>

<style scoped></style>