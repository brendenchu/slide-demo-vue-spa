<script setup lang="ts">
import { ActionButton, NavigationButton } from '../UI'
import { computed } from 'vue'
import type { Action, SlideOptions } from '../types'

const props = withDefaults(
  defineProps<{
    current?: number
    pages?: number
    actions?: SlideOptions<Action>
  }>(),
  {
    current: 1,
    pages: 5,
    actions: undefined,
  }
)

const hideNext = computed(() => {
  if (!props.actions) return false
  return Object.keys(props.actions).some(
    (key) => key !== 'previous' && props.actions?.[key]?.forced
  )
})
</script>

<template>
  <section class="bg-base-300 w-full sticky bottom-0">
    <div class="contained-sm">
      <div
        :class="{
          'justify-between': props.current > 1 && props.current <= pages,
          'justify-end': props.current === 1,
        }"
        class="grid grid-cols-3 gap-3 max-w-4xl mx-auto"
      >
        <div class="flex items-center justify-start">
          <NavigationButton
            v-show="props.actions?.previous?.forced || props.current > 1"
            theme="neutral"
            outline
            @click="props.actions?.previous?.callback()"
          >
            {{ props.actions?.previous?.label || '&laquo; Previous' }}
          </NavigationButton>
        </div>
        <div class="flex items-center justify-center">
          <slot name="display">
            <Transition
              enter-active-class="transition ease-out duration-300"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition ease-in duration-300"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <span
                v-if="props.current > 0 && props.current <= pages"
                class="hidden sm:inline-block text-lg font-bold text-base-content"
              >
                Page {{ props.current }} of {{ pages }}
              </span>
            </Transition>
          </slot>
        </div>
        <div class="flex items-center justify-end">
          <NavigationButton
            v-show="!hideNext && (props.actions?.next?.forced || props.current <= pages + 1)"
            :disabled="props.actions?.next?.blocked"
            @click="props.actions?.next?.callback()"
          >
            {{ props.actions?.next?.label || 'Next &raquo;' }}
          </NavigationButton>
          <ActionButton
            v-show="props.actions?.close?.forced || (props.current > pages + 1 && props.actions?.close)"
            @click.prevent="props.actions?.close?.callback()"
          >
            {{ props.actions?.close?.label || 'Close' }}
          </ActionButton>
        </div>
      </div>
    </div>
  </section>
</template>
