
<template>
    <svg xmlns="http://www.w3.org/2000/svg" :width="width" :height="width" viewBox="0 0 24 24">
        <path :fill="color" d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z"></path>
    </svg>
</template>

<script lang="ts">
export default {
    name: 'MaterialSymbolsAdd',
    props: {
        color: String,
        width: String
    }

}
</script>