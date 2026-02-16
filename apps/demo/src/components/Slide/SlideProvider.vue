<script setup lang="ts">
import { Content, Controls, Frame } from './Blocks'
import type { Action, Direction, SlideOptions } from './types'

const props = withDefaults(
  defineProps<{
    current?: number
    pages?: number
    actions?: SlideOptions<Action>
    direction?: Direction
  }>(),
  {
    current: 1,
    pages: 5,
    actions: undefined,
    direction: 'next',
  }
)
</script>

<template>
  <Frame>
    <Content
      v-for="i in pages"
      :key="`slide-content-${i}`"
      :active="props.current === i"
      :direction="props.direction"
    >
      <slot :name="`page-${i}`" />
    </Content>
  </Frame>
  <Controls
    v-if="props.actions"
    :current="props.current"
    :pages="pages"
    :actions="props.actions"
  />
</template>
