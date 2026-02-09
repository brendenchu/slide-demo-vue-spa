<script lang="ts" setup>
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const showParticles = computed(() => ['cyberpunk', 'vaporwave', 'unicorn'].includes(themeStore.currentTheme))

const cyberpunkOptions = {
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

const vaporwaveOptions = {
  fullScreen: {
    enable: true,
    zIndex: 0,
  },
  particles: {
    number: {
      value: 25,
      density: {
        enable: true,
        area: 800,
      },
    },
    color: {
      value: ['#ff71ce', '#01cdfe', '#b967ff', '#05ffa1'],
    },
    shape: {
      type: 'circle',
    },
    opacity: {
      value: { min: 0.05, max: 0.2 },
      animation: {
        enable: true,
        speed: 0.3,
        minimumValue: 0.03,
        sync: false,
      },
    },
    size: {
      value: { min: 1, max: 4 },
      animation: {
        enable: true,
        speed: 0.5,
        minimumValue: 0.5,
        sync: false,
      },
    },
    links: {
      enable: true,
      distance: 200,
      color: '#b967ff',
      opacity: 0.06,
      width: 1,
    },
    move: {
      enable: true,
      speed: 0.3,
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
        distance: 160,
        links: {
          opacity: 0.15,
        },
      },
    },
  },
  detectRetina: true,
}

const unicornOptions = {
  fullScreen: {
    enable: true,
    zIndex: 0,
  },
  particles: {
    number: {
      value: 35,
      density: {
        enable: true,
        area: 800,
      },
    },
    color: {
      value: ['#ff69b4', '#a855f7', '#fbbf24', '#34d399', '#60a5fa', '#f43f5e'],
    },
    shape: {
      type: 'circle',
    },
    opacity: {
      value: { min: 0.15, max: 0.4 },
      animation: {
        enable: true,
        speed: 0.8,
        minimumValue: 0.1,
        sync: false,
      },
    },
    size: {
      value: { min: 2, max: 5 },
      animation: {
        enable: true,
        speed: 1.5,
        minimumValue: 1,
        sync: false,
      },
    },
    links: {
      enable: true,
      distance: 130,
      color: '#ff69b4',
      opacity: 0.1,
      width: 1,
    },
    move: {
      enable: true,
      speed: 0.6,
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
        distance: 150,
        links: {
          opacity: 0.25,
        },
      },
    },
  },
  detectRetina: true,
}

const particleOptions = computed(() => {
  switch (themeStore.currentTheme) {
    case 'vaporwave':
      return vaporwaveOptions
    case 'unicorn':
      return unicornOptions
    default:
      return cyberpunkOptions
  }
})
</script>

<template>
  <vue-particles
    v-if="showParticles"
    :key="themeStore.currentTheme"
    id="tsparticles"
    :options="particleOptions"
  />
</template>
