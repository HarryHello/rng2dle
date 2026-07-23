import rawRules from './rules.json'
import type { RuleDefinition } from './types'
import { validateRules } from './validation'

export function loadRules(input: unknown): RuleDefinition[] {
  return validateRules(input)
}

export const rules = loadRules(rawRules)
