<script setup lang="ts">
import {useEditor, useMounted} from "lexical-vue";
import {$getRoot, $isElementNode} from "lexical";
import {
  $isBulletIconNode,
  $isOutlineItemContentNode,
  $isOutlineItemNode,
  $isOutlineNode,
  OutlineItemContentNode,
  OutlineItemNode,
  OutlineNode
} from "@/nodes";

/**
 * 用于检验outline的数据结构是否正确
 */
const editor = useEditor()

function $checkOutlineNode(outlineNode: OutlineNode) : boolean {
  // outline的children至少有一个outlineItem，且全部只能是outlineItem
  const outlineChildren = outlineNode.getChildren()
  if (outlineChildren.length === 0) {
    console.warn('outline should have at least one outlineItem')
    return false
  }
  for (const child of outlineChildren) {
    if (!$isOutlineItemNode(child)) {
      console.warn('outline children should be outlineItem')
      return false
    }
  }
  for (const outlineChild of outlineChildren) {
    const result = $checkOutlineItemNode(outlineChild as OutlineItemNode)
    if (!result) {
      return false
    }
  }
  return true
}

/**
 * 第一个children必须是bullet-icon
 * 第二个children必须是outline-item-content
 * 没有其他children
 * @param node
 */
function $checkOutlineItemNode(node: OutlineItemNode) : boolean {
  if (!$isOutlineItemNode(node)) {
    console.warn('node should be outlineItem')
    return false
  }
  const children = node.getChildren()
  if (children.length !== 2) {
    console.warn('outlineItem should have two children')
    return false
  }
  const [bulletIconNode, outlineItemContentNode] = children
  if (!$isBulletIconNode(bulletIconNode)) {
    console.warn('first of children should be bullet-icon')
    return false
  }
  if (!$isOutlineItemContentNode(outlineItemContentNode)) {
    console.warn('second of children should be outline-item-content')
    return false
  }
  return $checkOutlineItemContentNode(outlineItemContentNode)
}

/**
 * 第一个child是一个ElementNode
 * 可能有第二个child，如果有的话一定是outline
 * @param node
 */
function $checkOutlineItemContentNode(node: OutlineItemContentNode) : boolean {
  if (!$isOutlineItemContentNode(node)) {
    console.warn('node should be outlineItemContent')
    return false
  }
  const children = node.getChildren()
  if (children.length === 0 || children.length > 2) {
    console.warn('outlineItemContent should have at least one child and at most two children')
    return false
  }
  const [firstChild, secondChild] = children
  if (!$isElementNode(firstChild)) {
    console.warn('first of children should be an element node')
    return false
  }
  if (secondChild) {
    if (!$isOutlineNode(secondChild)) {
      console.warn('second of children should be an outline node')
      return false
    }
    return $checkOutlineNode(secondChild as OutlineNode)
  }
  return true
}

useMounted(() => {
  return editor.registerUpdateListener((payload) => {
    let check = true
    editor.getEditorState().read(() => {
      const root = $getRoot()
      // root的children只有一个outline
      const children = root.getChildren()
      if (children.length !== 1) {
        console.warn('children should not be zero or more than one')
        check = false
        return
      }
      const outlineNode = children[0]
      if (!$isOutlineNode(outlineNode)) {
        console.warn('first of children should be an outline node')
        check = false
        return
      }
      check = $checkOutlineNode(outlineNode)
    })
    if (!check) {
      editor.setEditorState(payload.prevEditorState, {
        tag: 'check-outline-node'
      })
    }
  })
})
</script>

<template>

</template>

<style scoped>

</style>