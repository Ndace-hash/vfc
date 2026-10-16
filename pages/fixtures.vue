<template>
    <section>

        <div class="border-b border-default">

            <div class="ps-4 flex gap-6 max-w-[1024px] mx-auto">
                <button @click.prevent="viewTab('fixture')"
                    :class="[tabClass($route.query.tab == 'fixture' || $route.query.tab == null)]">Fixture</button>
                <button @click.prevent="viewTab('result')"
                    :class="[tabClass($route.query.tab == 'result')]">Result</button>
                <button @click.prevent="viewTab('table')"
                    :class="[tabClass($route.query.tab == 'table')]">Table</button>
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
const tabClass = (active: boolean) => [
    // on the buttons themselves: buttons don't inherit text-transform
    'py-3 -mb-px border-b-2 uppercase',
    active ? 'border-primary text-primary font-semibold' : 'border-transparent text-toned hover:text-highlighted',
]
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