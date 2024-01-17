<script setup lang="ts">
import {onMounted} from "vue";
import {useEditor} from "lexical-vue";
import {
  $createParagraphNode,
  $getSelection, $isElementNode,
  $isRangeSelection, COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  INSERT_PARAGRAPH_COMMAND,
  KEY_ENTER_COMMAND
} from "lexical";
import {$createBulletIconNode} from "@/nodes/BulletIconNode";
import {$createBParagraphNode} from "@/nodes/BParagraphNode";


const editor = useEditor()

onMounted(() => {
  editor.registerCommand(KEY_ENTER_COMMAND, (payload, editor) => {
    const bParagraphNode = $createBParagraphNode('id:2')
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      console.log("selection.getNodes()", selection.getNodes());
    }
    return true
  }, COMMAND_PRIORITY_LOW)
  editor.registerCommand(INSERT_PARAGRAPH_COMMAND, (payload, editor) => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) {
      return false
    }
    console.log("selection.getNodes()", selection.getNodes());
    // only append
    const anchor = selection.anchor.getNode()
    const topLevelElement = anchor.getTopLevelElement()
    console.log("topLevelElement", topLevelElement);
    if (!$isElementNode(topLevelElement)) {
      return true
    }
    const bParagraphNode = $createBParagraphNode('id:2')
    bParagraphNode.append($createBulletIconNode())
    const paragraphNode = $createParagraphNode()
    bParagraphNode.append(paragraphNode)
    topLevelElement.insertAfter(bParagraphNode)
    paragraphNode.select()
    return true
  }, COMMAND_PRIORITY_LOW)
})
</script>

<template>
</template>
