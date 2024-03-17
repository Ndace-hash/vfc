<template>
    <main class="flex">
        <section
            class="bg-admin-dark min-h-screen w-[300px] flex flex-col items-center gap-12 sidebar fixed top-0 left-0">
            <div class="flex items-center justify-center w-[150px]">
                <img src="/valiant.png" alt="Valiant FC Logo" class="h-full w-full">
            </div>
            <nav class="flex flex-col gap-6 text-white">
                <RouterLink to="/admin" class="flex items-center justify-start gap-3 ">
                    <IconUser class="" color="#ffffff" width="50px" />
                    <span class="text-white font-bold flex items-center gap-10">{{ userStore.currentUser.displayName }}
                    </span>
                </RouterLink>
                <RouterLink to="/admin/players" class="font-bold capitalize">players</RouterLink>
                <RouterLink to="/admin/news" class="font-bold capitalize">News</RouterLink>
                <RouterLink to="/admin/club" class="font-bold capitalize">Clubs </RouterLink>
                <RouterLink to="/admin/fixture" class="font-bold capitalize">Fixtures</RouterLink>
                <UButton @click="openModal = true" class="font-bold capitalize">Create Admin</UButton>
            </nav>

        </section>
        <section class="bg-admin-light min-h-screen w-full overflow-y-auto ms-[300px]">

            <slot />
        </section>
        <UModal v-model="openModal">
            <UCard>
                <template #header>
                    <h2 class="text-primary font-bold text-xl capitalize">Add a new admin</h2>
                </template>
                <template #default>
                    <UForm :state="state" :schema="schema" class="flex flex-col gap-2" @submit="createUser">
                        <UFormGroup label="First Name" required name="firstName">
                            <UInput placeholder="First name" v-model="state.firstName" />
                        </UFormGroup>
                        <UFormGroup label="Last Name" required name="lastName">
                            <UInput placeholder="Last name" v-model="state.lastName" />
                        </UFormGroup>
                        <UFormGroup label="Phone Number" required name="phone">
                            <UInput placeholder="Phone number" v-model="state.phone" />
                        </UFormGroup>
                        <UFormGroup label="Email" required name="email">
                            <UInput placeholder="email" type="email" v-model="state.email" />
                        </UFormGroup>
                        <UFormGroup label="Password" required name="password">
                            <UInput placeholder="email" type="email" v-model="state.password" />
                        </UFormGroup>
                        <UFormGroup class="mt-2">
                            <UButton type="submit" label="Submit" />
                        </UFormGroup>
                    </UForm>

                </template>
            </UCard>
        </UModal>
    </main>
</template>

<script setup lang="ts">
import { auth, fireStore } from '~/config/firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { addDoc, collection, doc, setDoc } from 'firebase/firestore'
import { RouterLink } from 'vue-router';
import { z } from 'zod'

const openModal = ref(false)
const symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#!'

const generateRandomPassword = () => {
    let password = ''
    for (let i = 1; i <= 10; i++) {
        const randomIndex = Math.floor(Math.random() * symbols.length)
        password += symbols[randomIndex]
    }

    return password
}
const schema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    email: z.string().email('Invalid Email'),
    password: z.string().min(10)
})

type Schema = z.output<typeof schema>

const state = reactive({
    firstName: undefined,
    lastName: undefined,
    phone: undefined,
    email: '',
    password: ''
})

const userStore = useUserStore()
const createUser = async () => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, state.email, state.password)
        const user = await userCredential.user
        updateProfile(userCredential.user, {
            displayName: `${state.firstName} ${state.lastName}`,
        }).then(() => {

            const docRef = doc(fireStore, 'users', user.uid)
            setDoc(docRef, {
                firstName: state.firstName,
                lastName: state.lastName,
                phone: state.phone,
                email: state.email
            })
        }
        )
        await $fetch('/api/create-admin', {
            method: 'POST',
            body: { email: state.email }
        })

    } catch (e) {
        console.log(e)
    }

}

</script>

<style scoped lang="scss">
.sidebar {
    box-shadow: 1px 0px 8px 2px #757575;
}
</style>