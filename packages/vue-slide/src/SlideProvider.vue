<script setup lang="ts">
import { Content, Controls, Frame } from './Blocks'
import type { Action, SlideOptions } from './types'

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
</script>

<template>
  <Frame>
    <Content
      v-for="i in pages"
      :key="`slide-content-${i}`"
      :index="i"
      :current="props.current"
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
