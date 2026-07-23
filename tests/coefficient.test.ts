import { describe, expect, it } from 'vitest'
import { evaluateCoefficient } from '../src/game/rules/coefficient'

describe('evaluateCoefficient', () => {
  it('uses constant 1 by default', () => {
    expect(evaluateCoefficient(undefined, 0)).toBe(0)
    expect(evaluateCoefficient(undefined, 3)).toBe(1)
  })

  it('supports every coefficient strategy', () => {
    expect(evaluateCoefficient({ type: 'constant', value: 2 }, 4)).toBe(2)
    expect(evaluateCoefficient({ type: 'match-count' }, 4)).toBe(4)
    expect(evaluateCoefficient({ type: 'match-count-table', values: [0, 1, 3] }, 2)).toBe(3)
    expect(evaluateCoefficient({ type: 'polynomial', coefficients: [0, 1, 2] }, 3)).toBe(21)
    expect(evaluateCoefficient({ type: 'exponential', base: 2, scale: 3, offset: 1 }, 2)).toBe(13)
    expect(evaluateCoefficient({ type: 'power', exponent: 3, scale: 2, offset: 1 }, 2)).toBe(17)
  })

  it('always returns zero when there are no matches', () => {
    expect(evaluateCoefficient({ type: 'constant', value: 5 }, 0)).toBe(0)
    expect(evaluateCoefficient({ type: 'polynomial', coefficients: [10] }, 0)).toBe(0)
    expect(evaluateCoefficient({ type: 'exponential', base: 2, offset: 10 }, 0)).toBe(0)
    expect(evaluateCoefficient({ type: 'power', exponent: 0, offset: 10 }, 0)).toBe(0)
  })

  it('rejects invalid input and unsafe results', () => {
    expect(() => evaluateCoefficient(undefined, -1)).toThrow(RangeError)
    expect(() => evaluateCoefficient({ type: 'match-count-table', values: [0] }, 1)).toThrow(RangeError)
    expect(() =>
      evaluateCoefficient({ type: 'exponential', base: Number.MAX_SAFE_INTEGER }, 2),
    ).toThrow(RangeError)
  })
})
