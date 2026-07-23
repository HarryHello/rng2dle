export type Grid = number[][]

export interface LocalizedText {
  zh: string
  en: string
}

export interface RuleDefinition {
  id: string
  label: string
  name: LocalizedText
  description: LocalizedText
  baseScore: number
  matcherKey: string
  params?: unknown
}

export type RuleMatcher = (grid: Grid, params?: unknown) => number

export type CoefficientConfig =
  | { type: 'constant'; value: number }
  | { type: 'match-count' }
  | { type: 'match-count-table'; values: number[] }
  | { type: 'polynomial'; coefficients: number[] }
  | { type: 'exponential'; base: number; scale?: number; offset?: number }
  | { type: 'power'; exponent: number; scale?: number; offset?: number }

export interface PatternParams {
  pattern: string[]
  symbolValues?: Record<string, number[]>
  allowSameWith?: Record<string, string[]>
  multiple?: boolean
  allowOverlap?: boolean
  coefficient?: CoefficientConfig
}

export interface DigitConstraintsParams {
  requiredDigits?: number[]
  forbiddenDigits?: number[]
}
