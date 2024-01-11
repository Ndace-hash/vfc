<template>
    <table>
        <thead>
            <tr>
                <td>Pos</td>
                <td>Team</td>
                <td>P</td>
                <td>W</td>
                <td>D</td>
                <td>L</td>
                <td>GS</td>
                <td>GC</td>
                <td>GD</td>
                <td>Pts</td>
            </tr>
        </thead>
        <tbody class="">
            <tr v-for="(team, i) in teamStat" :key="i"
                :class="[team.club.name.toLowerCase() == 'valiant fc' ? 'bg-primary text-white' : 'bg-white text-black']">
                <td class="text-center">{{ team.pos }}</td>
                <td class="min-w-max flex">
                    <span>
                        {{ team.club.name }}
                    </span>
                </td>
                <td class="text-center">{{ team.matchesPlayed }}</td>
                <td class="text-center">{{ team.matchesWon }}</td>
                <td class="text-center">{{ team.matchesDrawn }}</td>
                <td class="text-center">{{ team.matchesLost }}</td>
                <td class="text-center">{{ team.goalScored }}</td>
                <td class="text-center">{{ team.goalAgainst }}</td>
                <td class="text-center">{{ team.goalDifference }}</td>
                <td class="text-center">{{ team.points }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts">
import type { TeamStat } from '~/types/Team'
defineProps<{ teamStat: TeamStat[] | null }>()
</script>


<style lang="scss" scoped>
table {
    @apply rounded-[8px] overflow-hidden w-full max-w-[950px] shadow-lg;

    thead {
        @apply bg-primary text-white font-semibold w-full;

        td {
            @apply px-1 lg:px-4 py-1 w-full;
        }
    }

    tbody {
        @apply w-full;

        tr {
            @apply border-b border-primary;

            td {
                @apply px-1 lg:px-4 py-2;
            }
        }
    }
}
</style>