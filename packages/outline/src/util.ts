export type CannotBackspaceErrorCodeType = number

/**
 * cannot backspace because it is the last outline item in root outline node
 */
export const CANNOT_BACKSPACE_ERROR_CODE_1: CannotBackspaceErrorCodeType = 1
/**
 * cannot backspace because it has child outline items
 */
export const CANNOT_BACKSPACE_ERROR_CODE_2: CannotBackspaceErrorCodeType = 2
/**
 * cannot backspace because it is the first outline item in outline node and it has child outline items
 */
export const CANNOT_BACKSPACE_ERROR_CODE_3: CannotBackspaceErrorCodeType = 3


export type CannotDeleteErrorCodeType = number
export const CANNOT_DELETE_ERROR_CODE_1: CannotDeleteErrorCodeType = 1

export const CANNOT_DELETE_ERROR_CODE_2: CannotDeleteErrorCodeType = 2

export const CANNOT_DELETE_ERROR_CODE_3: CannotDeleteErrorCodeType = 3