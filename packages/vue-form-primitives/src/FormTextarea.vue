<script lang="ts" setup>
import { onMounted, ref } from 'vue'

defineProps<{
  modelValue: string
}>()

defineEmits(['update:modelValue'])

const input = ref<HTMLInputElement | null>(null)

onMounted(() => {
  if (input.value?.hasAttribute('autofocus')) {
    input.value?.focus()
  }
})

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <textarea
    ref="input"
    :value="modelValue"
    class="border-base-300 bg-base-100 text-base-content focus:border-primary focus:ring-primary rounded-md shadow-sm"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
