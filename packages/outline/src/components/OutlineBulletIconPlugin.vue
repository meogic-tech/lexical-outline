<script setup lang="ts">/**
 * 这个插件的用途是使得在聚焦BulletIconNode的时候，自动切换聚焦到后面的节点
 */
import {useEditor} from "lexical-vue";
import {onMounted} from "vue";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW, ParagraphNode,
  SELECTION_CHANGE_COMMAND
} from "lexical";
import {$isBulletIconNode} from "@/nodes";

const editor = useEditor()

onMounted(() => {
  editor.registerCommand(SELECTION_CHANGE_COMMAND, () => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) {
      return false
    }
    const nodes = selection.getNodes()
    if (nodes.length === 1 && $isBulletIconNode(nodes[0])) {
      const bulletIconNode = nodes[0]
      let nextSibling = bulletIconNode.getNextSibling()
      if (!nextSibling) {
        nextSibling = $createParagraphNode()
      }
      (nextSibling as ParagraphNode).select(0, 0)
      return true
    }
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if ($isBulletIconNode(node)) {

      }
    }
    return false
  }, COMMAND_PRIORITY_LOW)
})
</script>

<template>

</template>

<style scoped>

</style>