<template>
  <div>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template> 

<script setup>
import { getDocs, where, query, collection } from 'firebase/firestore'
import { fireStore } from '~/config/firebase'
const valiant = useState('valiant')

const q = query(collection(fireStore, 'clubs'), where('name', '==', 'Valiant FC'))
getDocs(q).then(snapshot => {
  const doc = snapshot.docs[0]

  valiant.value = { id: doc.id, logo: doc.data().logo, name: doc.data().name }
})

</script>