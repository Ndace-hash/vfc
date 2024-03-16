<template>
    <section>

        <div class="bg-admin-light">

            <div class="ps-4 py-2 flex gap-6 text-white uppercase max-w-[1024px] mx-auto">
                <button @click.prevent="viewTab('fixture')">Fixture</button>
                <button @click.prevent="viewTab('result')">Result</button>
                <button @click.prevent="viewTab('table')">Table</button>
            </div>
        </div>

        <div>
            <component :is="tabs[currentTab]" />
        </div>
    </section>
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()

const currentTab = shallowRef(0)
const tabsObject = {
    fixture: 0,
    result: 1,
    table: 2
}
const viewTab = (tab: string) => {
    router.push({
        path: '/fixtures',
        query: {
            tab
        }
    })
    currentTab.value = tabsObject[tab]
}
const Fixtures = resolveComponent('Fixtures')
const Results = resolveComponent('FixturesResult')
const Table = resolveComponent('FixturesTable')

onBeforeMount(() => {
    currentTab.value = tabsObject[route.query.tab]
    if (route.query.tab == null) currentTab.value = 0
})

const tabs = shallowRef([Fixtures, Results, Table])
</script>

<style scoped></style>