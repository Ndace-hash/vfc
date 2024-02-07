<template>
    <div class="absolute inset-0 flex items-center justify-center">
        <UCard class="w-full max-w-[600px] shadow-lg">
            <template #header>
                <h2 class="text-primary font-bold capitalize text-xl">Login as Admin</h2>
            </template>
            <template #default>
                <UForm :state="state" class="flex flex-col gap-8" :schema="schema" @submit="login">

                    <UFormGroup label="Email" class="w-3/4" name="email">
                        <UInput v-model="state.email" />
                    </UFormGroup>
                    <UFormGroup label="Password" class="w-3/4" name="password">
                        <UInput type="password" v-model="state.password" />
                    </UFormGroup>
                    <UFormGroup>
                        <UButton label="Login" type="submit" />
                    </UFormGroup>
                </UForm>
            </template>
        </UCard>
    </div>
</template>

<script setup lang="ts">
import { signInWithEmailAndPassword, type User } from 'firebase/auth'
import { auth } from '~/config/firebase'
import { z } from 'zod'
definePageMeta({
    layout: false
})
const user = useState<null | User>('user', () => null)
const state = reactive({
    email: '',
    password: ''
})

const schema = z.object({
    email: z.string().email('Invalid Email'),
    password: z.string().min(8, 'Must be at least 8 characters.')
})

const login = () => {
    try {
        signInWithEmailAndPassword(auth, state.email, state.password).then(userCredential => {
            user.value = userCredential.user
            console.log(userCredential)
        })

        if (user.value != null) {
            navigateTo('/admin')
        }

    } catch (e) {
        console.error(e)
    }
}
</script>

<style scoped></style>