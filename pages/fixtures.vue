<template>
    <section>

        <div class="bg-admin-light">

            <div class="ps-4 py-2 flex gap-6 text-white uppercase max-w-[1024px] mx-auto">
                <button @click.prevent="viewTab('fixture')"
                    :class="[($route.query.tab == 'fixture' || $route.query.tab == null) ? 'border-b-2 border-b-white' : '', 'py-1']">Fixture</button>
                <button @click.prevent="viewTab('result')"
                    :class="[($route.query.tab == 'result') ? 'border-b-2 border-b-white' : '', 'py-1']">Result</button>
                <button @click.prevent="viewTab('table')"
                    :class="[$route.query.tab == 'table' ? 'border-b-2 border-b-white' : '', 'py-1']">Table</button>
            </div>
        </div>

        <div>
            <component :is="tabs[currentTab]" />
        </div>
    </section>
</template>

<script setup lang="ts">
import { useFixtures } from '~/stores/Fixtures'
const router = useRouter()
const route = useRoute()
const { data } = await useFetch('/api/get-fixtures')

const matches = useFixtures()
matches.fixtures = data.value![0]
matches.result = data.value![1]


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

console.log(data.value)
</script>

<style scoped></style>