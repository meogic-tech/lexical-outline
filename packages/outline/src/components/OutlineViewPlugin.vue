<script setup lang="ts">
import {onMounted} from "vue";
import {useEditor} from "lexical-vue";
import {
  $createParagraphNode,
  $getSelection, $isElementNode,
  $isRangeSelection, COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  INSERT_PARAGRAPH_COMMAND,
  KEY_ENTER_COMMAND, KEY_TAB_COMMAND,
} from "lexical";
import { mergeRegister } from '@lexical/utils';
import {$createBulletIconNode} from "@/nodes/BulletIconNode";
import {$createOutlineItemNode, $isOutlineItemNode} from "@/nodes/OutlineItemNode";
import {$createOutlineItemContentNode, $createOutlineNode} from "@/nodes";


const editor = useEditor()

let unregister: () => void

onMounted(() => {
  unregister = mergeRegister(
    editor.registerCommand(INSERT_PARAGRAPH_COMMAND, (payload, editor) => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        return false
      }
      // only append
      const anchor = selection.anchor.getNode()
      const topLevelElement = anchor.getTopLevelElement()
      if (!$isElementNode(topLevelElement)) {
        return true
      }
      const outlineItemNode = $createOutlineItemNode('id:2')
      const newParagraphNode = $createParagraphNode()
      outlineItemNode
          .append($createBulletIconNode())
          .append($createOutlineItemContentNode().append(newParagraphNode))
      topLevelElement.insertAfter(outlineItemNode)
      newParagraphNode.select()
      return true
    }, COMMAND_PRIORITY_LOW),
    editor.registerCommand(KEY_TAB_COMMAND, (payload: KeyboardEvent, editor) => {
      payload.preventDefault()
      const selection = $getSelection()
      const nodes = selection.getNodes()
      if (nodes.length === 1) {
        const firstNode = nodes[0]
        let outlineItemNode = firstNode.getParent()?.getParent()?.getParent()
        console.log("outlineItemNode", outlineItemNode);
        const previousOutlineItemNode = outlineItemNode.getPreviousSibling()
        if ($isOutlineItemNode(outlineItemNode) && $isOutlineItemNode(previousOutlineItemNode)) {
          previousOutlineItemNode.getOutlineItemContentNode().append(
              $createOutlineNode()
                  .append(outlineItemNode)
          )
        }
      }
      return false
    }, COMMAND_PRIORITY_LOW)
  )
})
</script>

<template>
</template>
