<script setup lang="ts">
import {useEditor, useMounted} from "lexical-vue";
import {$getRoot, $getSelection, $isDecoratorNode, $isElementNode, $isRangeSelection, ElementNode} from "lexical";
import {
  $isLexicalBulletIconNode,
  $isLexicalOutlineItemContentNode,
  $isLexicalOutlineItemNode,
  $isLexicalOutlineNode,
  LexicalOutlineItemContentNode,
  LexicalOutlineItemNode,
  LexicalOutlineNode
} from "@/nodes";
import {$getParentOutlineItem} from "@/outline-util";

/**
 * 用于检验outline的数据结构是否正确
 */
const editor = useEditor()

/**
 * 检查不通过的事件
 * 事件checkError，第一个参数是relativeNode: OutlineNode | OutlineItemNode | OutlineItemContentNode | null
 */
const emit = defineEmits<{
  (event: 'checkError', relativeHTMLElement: HTMLElement | null): void;
}>();

interface CheckResult {
  success: boolean
  relativeNode: LexicalOutlineNode | LexicalOutlineItemNode | LexicalOutlineItemContentNode | null
}

function $checkOutlineNode(outlineNode: LexicalOutlineNode) : CheckResult {
  // outline的children至少有一个outlineItem，且全部只能是outlineItem
  const outlineChildren = outlineNode.getChildren()
  if (outlineChildren.length === 0) {
    console.warn('outline should have at least one outlineItem')
    return {
      success: false,
      relativeNode: outlineNode
    }
  }
  for (const child of outlineChildren) {
    if (!$isLexicalOutlineItemNode(child)) {
      console.warn('outline children should be outlineItem')
      return {
        success: false,
        relativeNode: outlineNode
      }
    }
  }
  for (const outlineChild of outlineChildren) {
    const result = $checkOutlineItemNode(outlineChild as LexicalOutlineItemNode)
    if (!result.success) {
      return result
    }
  }
  return {
    success: true,
    relativeNode: outlineNode
  }
}

/**
 * 第一个children必须是outline-item-content
 * 第二个children必须是outline
 * 没有其他children
 * @param node
 */
function $checkOutlineItemNode(node: LexicalOutlineItemNode) : CheckResult {
  if (!$isLexicalOutlineItemNode(node)) {
    console.warn('node should be outlineItem')
    return {
      success: false,
      relativeNode: node
    }
  }
  const children = node.getChildren()
  if (children.length === 0) {
    console.warn('outlineItem should have outline item content node')
    return {
      success: false,
      relativeNode: node
    }
  }
  if (children.length > 2) {
    console.warn('outlineItem should only have two children')
    return {
      success: false,
      relativeNode: node
    }
  }
  const [outlineItemContentNode, outlineNode] = children
  if (!$isLexicalOutlineItemContentNode(outlineItemContentNode)) {
    console.warn('first of children should be outline-item-content')
    return {
      success: false,
      relativeNode: node
    }
  }
  const result = $checkOutlineItemContentNode(outlineItemContentNode)
  if (!result.success) {
    return result
  }
  if (outlineNode) {
    if (!$isLexicalOutlineNode(outlineNode)) {
      console.warn('second of children should be outline node')
      return {
        success: false,
        relativeNode: node
      }
    }
    const result = $checkOutlineNode(outlineNode as LexicalOutlineNode)
    if (!result.success) {
      return {
        success: false,
        relativeNode: node
      }
    }
  }
  return {
    success: true,
    relativeNode: node
  }
}

/**
 * 第一个child是一个bullet-icon
 * 可能有第二个child，是一个ElementNode
 * @param node
 */
function $checkOutlineItemContentNode(node: LexicalOutlineItemContentNode) : CheckResult {
  if (!$isLexicalOutlineItemContentNode(node)) {
    console.warn('node should be outlineItemContent')
    return {
      success: false,
      relativeNode: node
    }
  }
  const children = node.getChildren()
  if (children.length !== 2) {
    console.warn('outlineItemContent should have must two children')
    return {
      success: false,
      relativeNode: node
    }
  }
  const [bulletIconNode, elementOrDecoratorNode] = children

  if(!$isLexicalBulletIconNode(bulletIconNode)) {
    console.warn('first of children should be a bullet-icon node')
    return {
      success: false,
      relativeNode: node
    }
  }

  if (elementOrDecoratorNode) {
    if (!$isElementNode(elementOrDecoratorNode) && !$isDecoratorNode(elementOrDecoratorNode)) {
      console.warn('second of children should be an element node or decorator node')
      return {
        success: false,
        relativeNode: node
      }
    }
  }
  return {
    success: true,
    relativeNode: node
  }
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
      if (!$isLexicalOutlineNode(outlineNode)) {
        console.warn('first of children should be an outline node')
        check = false
        return
      }
      const result = $checkOutlineNode(outlineNode)
      if (!result.success) {
        check = false
        return
      }
    })
    if (!check) {
      editor.setEditorState(payload.prevEditorState, {
        tag: 'check-outline-node'
      })
      editor.getEditorState().read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) {
          return
        }
        const outlineItemNode = $getParentOutlineItem(selection.focus.getNode())
        if (!outlineItemNode) {
          return
        }
        const outlineItemContentNode = (outlineItemNode as LexicalOutlineItemNode).getOutlineItemContentNode()
        if (!outlineItemContentNode) {
          return
        }
        const element = editor.getElementByKey(outlineItemContentNode.getKey())
        emit('checkError', element)
      })
    }
  })
})
</script>

<template>

</template>

<style scoped>

</style>