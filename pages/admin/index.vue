<template>
    <section>
        Admin page
    </section>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'admin',
})
const router = useRouter()
router.push({ path: '/admin/players' })
</script>

<style scoped></style>