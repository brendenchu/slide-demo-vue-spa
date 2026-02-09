<script lang="ts" setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const showParticles = computed(() => themeStore.currentTheme === 'cyberpunk')

const options = {
  fullScreen: {
    enable: true,
    zIndex: 0,
  },
  particles: {
    number: {
      value: 40,
      density: {
        enable: true,
        area: 800,
      },
    },
    color: {
      value: ['#00f0ff', '#ff2d95', '#b026ff'],
    },
    shape: {
      type: 'circle',
    },
    opacity: {
      value: { min: 0.1, max: 0.3 },
      animation: {
        enable: true,
        speed: 0.5,
        minimumValue: 0.05,
        sync: false,
      },
    },
    size: {
      value: { min: 1, max: 3 },
      animation: {
        enable: true,
        speed: 1,
        minimumValue: 0.5,
        sync: false,
      },
    },
    links: {
      enable: true,
      distance: 150,
      color: '#00f0ff',
      opacity: 0.08,
      width: 1,
    },
    move: {
      enable: true,
      speed: 0.5,
      direction: 'none' as const,
      random: true,
      straight: false,
      outModes: {
        default: 'out' as const,
      },
    },
  },
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: 'grab',
      },
    },
    modes: {
      grab: {
        distance: 140,
        links: {
          opacity: 0.2,
        },
      },
    },
  },
  detectRetina: true,
}
</script>

<template>
  <vue-particles v-if="showParticles" id="tsparticles" :options="options" />
</template>
