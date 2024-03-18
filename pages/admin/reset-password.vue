<template>
    <div class="max-w-[500px] mx-auto py-6 flex flex-col gap-4">
        <h1 class="text-primary font-bold uppercase">Reset password</h1>
        <UForm :state="state" @submit="resetPassword" :schema="schema" class="flex flex-col gap-4">
            <UFormGroup name="email">
                <template #label>
                    <p class="text-xs mb-2">Please enter your Admin Email address.</p>
                </template>
                <UInput type="email" v-model="state.email" />
            </UFormGroup>



            <UButton type="submit" label="Submit" class="w-max " size="md" :loading="isLoading" :disabled="successful"
                v-if="!successful" />
            <UButton label="Go back to Login" class="w-max" size="md" v-else
                @click="() => $router.push('/admin/login')" />


        </UForm>

        <p class="text-xs text-primary font-bold" v-if="successful">A password reset email has been sent to {{
            state.email }}.
            Please
            Check your
            spams if
            you do
            no fint
            the
            email in
            your inbox.</p>

    </div>
</template>

<script setup lang="ts">
import { auth } from '~/config/firebase'
import { sendPasswordResetEmail } from 'firebase/auth'
import { z } from 'zod'
definePageMeta({
    layout: false
})
const state = reactive({
    email: ''
})

const schema = z.object({ email: z.string().email('Invalid Email address') })

const successful = ref(false)
const isLoading = ref(false)
const resetPassword = async () => {
    try {
        isLoading.value = true
        await sendPasswordResetEmail(auth, state.email)
        isLoading.value = false
        successful.value = true
    } catch (error) {
        return error
    }
}
</script>

<style lang="scss" scoped></style>