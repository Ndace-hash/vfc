<template>
    <PlayerDisplay position="Goalkeepers" :player-list="goalkeepers" />
    <PlayerDisplay position="Defenders" :player-list="defenders" />
    <PlayerDisplay position="Mid Fielders" :player-list="midfielders" />
    <PlayerDisplay position="Forwards" :player-list="forwards" />
</template>

<script setup lang="ts">
// import { fireStore } from '~/config/firebase'
import { getDocs, collection } from 'firebase/firestore'
import type { Player } from '~/types/Player';
import type { FirebaseState } from '~/types/Firebase'

const firebase = useState<FirebaseState>('firebase')
const players = ref<Player[]>([])
const collectionRef = collection(firebase.value.fireStore, 'players')
onBeforeMount(async () => {
    // const { data, error } = useFetch<Player[]>('/api/get-players')
    // players.value = data.value
    try {
        const snapshot = await getDocs(collectionRef)

        snapshot.docs.forEach((doc) => {
            const data = doc.data()

            players.value?.push({
                id: doc.id,
                firstName: String(data.firstName),
                lastName: String(data.lastName),
                gender: String(data.gender),
                position: String(data.position),
                number: Number(data.number),
                stateOfOrigin: String(data.stateOfOrigin),
                DoB: data.DoB,
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
        return players.value?.filter(player => player.position.toLowerCase() === position)
    })
}

const goalkeepers = seperatePlayersByPosition('goalkeeper')
const defenders = seperatePlayersByPosition('defender')
const midfielders = seperatePlayersByPosition('midfielder')
const forwards = seperatePlayersByPosition('forward')

</script>
