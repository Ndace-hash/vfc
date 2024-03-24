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
                        <RouterLink to="/admin/reset-password" class="underline text-primary py-4">Forgot your password?
                        </RouterLink>
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
import { auth } from '~/config/firebase'
import { z } from 'zod'
import type { IdTokenResult } from 'firebase/auth';
definePageMeta({
    layout: false
})
const userStore = useUserStore()

const state = reactive({
    email: '',
    password: ''
})

const schema = z.object({
    email: z.string().email('Invalid Email'),
    password: z.string().min(8, 'Must be at least 8 characters.')
})

const login = async () => {
    try {
        await userStore.setUser(state)
        auth.currentUser?.getIdTokenResult().then((idTokenResult: IdTokenResult) => {
            userStore.isAdmin = idTokenResult.claims.admin as boolean
            if (userStore.currentUser && (userStore.isAdmin || auth.currentUser?.email == 'japheth@valiantfc.com')) navigateTo({ path: '/admin' })
        })

    } catch (error) {
        console.log(error)
    }
}
</script>

<style scoped></style>