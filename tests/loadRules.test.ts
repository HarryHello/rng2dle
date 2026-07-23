import { describe, expect, it } from 'vitest'
import { loadRules } from '../src/game/rules/loadRules'

const validRule = {
  id: 'rule-1',
  label: 'example',
  name: { zh: '示例', en: 'Example' },
  description: { zh: '描述', en: 'Description' },
  baseScore: 100,
  matcherKey: 'pattern-matcher',
  params: { pattern: ['#*'] },
}

describe('loadRules', () => {
  it('loads valid rules', () => {
    expect(loadRules([validRule])).toEqual([validRule])
  })

  it('rejects duplicate ids and labels', () => {
    expect(() => loadRules([validRule, { ...validRule, label: 'other' }])).toThrow(/duplicate id/)
    expect(() => loadRules([validRule, { ...validRule, id: 'rule-2' }])).toThrow(/duplicate label/)
  })

  it('rejects unknown matchers and fields', () => {
    expect(() => loadRules([{ ...validRule, matcherKey: 'unknown' }])).toThrow(/unknown matcher key/)
    expect(() => loadRules([{ ...validRule, extra: true }])).toThrow(/not a supported field/)
  })

  it('rejects malformed patterns and invalid symbol references', () => {
    expect(() =>
      loadRules([{ ...validRule, params: { pattern: ['##', '#'] } }]),
    ).toThrow(/rectangular/)
    expect(() =>
      loadRules([{ ...validRule, params: { pattern: ['#######'] } }]),
    ).toThrow(/must not exceed/)
    expect(() =>
      loadRules([{
        ...validRule,
        params: { pattern: ['##'], symbolValues: { '*': [1] } },
      }]),
    ).toThrow(/must refer to a symbol/)
  })

  it('validates equality permissions and overlap settings', () => {
    expect(() =>
      loadRules([{
        ...validRule,
        params: { pattern: ['#*'], allowSameWith: { '#': ['#'] } },
      }]),
    ).toThrow(/must not refer to itself/)
    expect(() =>
      loadRules([{
        ...validRule,
        params: { pattern: ['#'], allowOverlap: false },
      }]),
    ).toThrow(/only valid when multiple is true/)
  })

  it('validates coefficient strategies over the full match range', () => {
    expect(() =>
      loadRules([{
        ...validRule,
        params: {
          pattern: ['###'],
          multiple: true,
          coefficient: { type: 'match-count-table', values: [0, 1] },
        },
      }]),
    ).toThrow(/must contain 25 entries/)
    expect(() =>
      loadRules([{
        ...validRule,
        params: {
          pattern: ['#'],
          multiple: true,
          coefficient: { type: 'polynomial', coefficients: [-1] },
        },
      }]),
    ).toThrow(/produces invalid coefficient/)
  })

  it('validates digit constraints', () => {
    const digitRule = {
      ...validRule,
      matcherKey: 'digit-constraints',
      params: { requiredDigits: [4, 5], forbiddenDigits: [0, 9] },
    }
    expect(loadRules([digitRule])).toEqual([digitRule])
    expect(() => loadRules([{ ...digitRule, params: {} }])).toThrow(/must provide/)
    expect(() =>
      loadRules([{ ...digitRule, params: { requiredDigits: [1], forbiddenDigits: [1] } }]),
    ).toThrow(/both required and forbidden/)
    expect(() =>
      loadRules([{ ...digitRule, params: { requiredDigits: [1, 1] } }]),
    ).toThrow(/duplicate digits/)
  })
})
