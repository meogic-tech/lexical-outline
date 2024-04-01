<script lang="ts" setup>
import { useEditor } from 'lexical-vue';
import { onMounted, onUnmounted } from 'vue';
import {registerCodeHighlighting} from "@lexical/code";

const editor = useEditor()
let unregisterListener: () => void

onMounted(() => {
  unregisterListener = registerCodeHighlighting(editor)
})

onUnmounted(() => {
  unregisterListener()
})
</script>

<template />

<style scoped lang="scss">

</style>
