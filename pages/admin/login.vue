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
import { z } from 'zod'
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
    await userStore.setUser(state)
    if (userStore.currentUser) return navigateTo({ path: '/admin' })
}
</script>

<style scoped></style>