<script setup lang="ts">
import {onMounted, onUnmounted} from "vue";
import {useEditor} from "lexical-vue";
import {
  $createParagraphNode, $getNodeByKey,
  $getSelection, $isElementNode,
  $isRangeSelection, COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  INSERT_PARAGRAPH_COMMAND,
  KEY_ENTER_COMMAND, KEY_TAB_COMMAND,
} from "lexical";
import { mergeRegister } from '@lexical/utils';
import {$createBulletIconNode} from "@/nodes/BulletIconNode";
import {$createOutlineItemNode, $isOutlineItemNode, OutlineItemNode} from "@/nodes/OutlineItemNode";
import {$createOutlineNode, $isOutlineNode, OutlineNode} from "@/nodes/OutlineNode";
import {
  $getChildOutline,
  $getChildOutlines,
  $getChildOutlinesByOutlineNode,
  $getParentOutline,
  $getParentOutlineItem
} from "@/table-util";
import {$createOutlineItemContentNode} from "@/nodes";
import {COLLAPSE_OUTLINE_COMMAND} from "@/commands";


const editor = useEditor()

let unregister: () => void

function indent(): boolean {
  const selection = $getSelection()
  if (!selection) {
    return false
  }
  const nodes = selection.getNodes()
  if (nodes.length === 1) {
    const firstNode = nodes[0]
    const outlineItemNode = $getParentOutlineItem(firstNode)
    if (!outlineItemNode) {
      return false
    }
    const previousOutlineItemNode = outlineItemNode.getPreviousSibling()
    if ($isOutlineItemNode(outlineItemNode) && $isOutlineItemNode(previousOutlineItemNode)) {
      previousOutlineItemNode.getOutlineItemContentNode().append(
          $createOutlineNode()
              .append(outlineItemNode)
      )
      previousOutlineItemNode.select()
      editor.dispatchCommand(COLLAPSE_OUTLINE_COMMAND, false)
      return true
    }
  }
  return false
}

function outdent(): boolean {
  const selection = $getSelection()
  if (!selection) {
    return false
  }
  const nodes = selection.getNodes()
  if (nodes.length === 1) {
    const firstNode = nodes[0]
    const currentOutlineItemNode = $getParentOutlineItem(firstNode)
    if (!currentOutlineItemNode) {
      return false
    }
    const outlineNode = $getParentOutline(firstNode)
    if (!outlineNode) {
      return false
    }
    const parentOutlineNode = $getParentOutline(outlineNode)
    if (!parentOutlineNode) {
      return false
    }
    // parentOutlineNode.setCollapsed(false)
    parentOutlineNode.append(currentOutlineItemNode)
    return true
  }
  return false
}

const onClick = (event: MouseEvent) => {
  // .editor-outline-chevron-container
  const target = event.target as HTMLElement
  const spot = target.closest('.editor-outline-item-spot')
  if (!spot) {
    return
  }
  for (const [key, dom] of Array.from(editor._keyToDOMMap.entries())) {
    if (dom === spot) {
      const isGotoCollapse = editor.getEditorState().read(() => {
        const node = $getNodeByKey(key)
        if (!node) {
          return false
        }
        const outlineItem = $getParentOutlineItem(node)
        if ($isOutlineItemNode(outlineItem)) {
          return true
        }
      })
      if (isGotoCollapse) {
        editor.update(() => {
          const node = $getNodeByKey(key)
          if (!node) {
            return false
          }
          const outlineItem = $getParentOutlineItem(node)
          if ($isOutlineItemNode(outlineItem)) {
            outlineItem.select()
            editor.dispatchCommand(COLLAPSE_OUTLINE_COMMAND, !outlineItem.getCollapse())
          }
        })
      }
    }
  }
}

onMounted(() => {
  editor.getRootElement()!.addEventListener('click', onClick)
  unregister = mergeRegister(
    editor.registerCommand(COLLAPSE_OUTLINE_COMMAND, (collapse: boolean) => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        console.warn('not range selection')
        return false
      }
      const nodes = selection.getNodes()
      for (let node of nodes) {
        const outlineNode = $getParentOutline(node)
        if (!$isOutlineNode(outlineNode)) {
          continue;
        }
        const outlineItemNode = $getParentOutlineItem(outlineNode)
        if (!$isOutlineItemNode(outlineItemNode)) {
          continue;
        }
        outlineItemNode.setCollapsed(collapse)
        $getChildOutlines(outlineItemNode).forEach(outline => {
          outline.setDisplay(!collapse)
        })
      }

      return false
    }, COMMAND_PRIORITY_LOW),
    editor.registerCommand(INSERT_PARAGRAPH_COMMAND, (payload, editor) => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        return false
      }
      // only append
      const anchor = selection.anchor.getNode()
      const parentOutlineItemNode = $getParentOutlineItem(anchor)
      if (parentOutlineItemNode === null) {
        return false
      }
      const outlineItemNode = $createOutlineItemNode('id:2', false)
      const newParagraphNode = $createParagraphNode()
      outlineItemNode
          .append($createBulletIconNode())
          .append($createOutlineItemContentNode().append(newParagraphNode))
      const childOutline = $getChildOutline(parentOutlineItemNode)
      if (childOutline && !parentOutlineItemNode.getCollapse()) {
        childOutline.splice(0, 0, [outlineItemNode])
      } else {
        parentOutlineItemNode.insertAfter(outlineItemNode)
      }
      newParagraphNode.select()
      return true
    }, COMMAND_PRIORITY_LOW),
    editor.registerCommand(KEY_TAB_COMMAND, (event: KeyboardEvent, editor) => {
      event.preventDefault()
      return event.shiftKey ? outdent() : indent()
    }, COMMAND_PRIORITY_LOW),
    editor.registerMutationListener(OutlineNode, (nodes, payload) => {
      for (const key of nodes.keys()) {
        if (nodes.get(key) === 'updated') {
          const isToRemove = editor.getEditorState().read(() => {
            const node = $getNodeByKey(key)
            return $isOutlineNode(node) && node.getChildrenSize() === 0
          })
          if (isToRemove) {
            editor.update(() => {
              const node = $getNodeByKey(key)
              node?.remove()
            })
          }
        }
      }
    }),
  )
})

onUnmounted(() => {
  unregister()
  editor.getRootElement().removeEventListener('click', onClick)
})
</script>

<template>
</template>
