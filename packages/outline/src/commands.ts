import {createCommand} from "lexical";

export const COLLAPSE_OUTLINE_COMMAND = createCommand<{
  outlineItemKey: string
  collapsed: boolean
}>('COLLAPSE_OUTLINE_COMMAND')