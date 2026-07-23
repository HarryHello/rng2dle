import type { CoefficientConfig } from './types'

function assertCoefficient(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`Coefficient must be a non-negative safe integer, received ${value}`)
  }
  return value
}

export function evaluateCoefficient(
  config: CoefficientConfig | undefined,
  matchCount: number,
): number {
  if (!Number.isSafeInteger(matchCount) || matchCount < 0) {
    throw new RangeError(`Match count must be a non-negative safe integer, received ${matchCount}`)
  }

  if (matchCount === 0) return 0

  const strategy = config ?? { type: 'constant', value: 1 }
  let value: number

  switch (strategy.type) {
    case 'constant':
      value = strategy.value
      break
    case 'match-count':
      value = matchCount
      break
    case 'match-count-table':
      value = strategy.values[matchCount] as number
      break
    case 'polynomial':
      value = strategy.coefficients.reduceRight(
        (result, coefficient) => result * matchCount + coefficient,
        0,
      )
      break
    case 'exponential':
      value = (strategy.scale ?? 1) * strategy.base ** matchCount + (strategy.offset ?? 0)
      break
    case 'power':
      value = (strategy.scale ?? 1) * matchCount ** strategy.exponent + (strategy.offset ?? 0)
      break
  }

  return assertCoefficient(value)
}
