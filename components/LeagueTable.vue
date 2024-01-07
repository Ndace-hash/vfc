<template>
    <table>
        <thead>
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
        </thead>
        <tbody class="">
            <tr v-for="(team, i) in teamStat" :key="i">
                <td>{{ team.pos }}</td>
                <td class="min-w-max flex">
                    <span>
                        <img :src="team.club.logo" :alt="team.club.name">
                    </span>
                    <span>
                        {{ team.club.name }}
                    </span>
                </td>
                <td>{{ team.matchesPlayed }}</td>
                <td>{{ team.matchesWon }}</td>
                <td>{{ team.matchesDrawn }}</td>
                <td>{{ team.matchesLost }}</td>
                <td>{{ team.goalScored }}</td>
                <td>{{ team.goalAgainst }}</td>
                <td>{{ team.goalDifference }}</td>
                <td>{{ team.points }}</td>
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
            @apply px-4 py-1 w-full;
        }
    }

    tbody {
        @apply w-full;

        tr {
            @apply border-b border-primary;

            td {
                @apply px-4 py-2;
            }
        }
    }
}
</style>