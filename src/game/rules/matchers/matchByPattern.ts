import { evaluateCoefficient } from '../coefficient'
import type { Grid, PatternParams } from '../types'

function symbolPair(left: string, right: string): string {
  return left < right ? `${left}\0${right}` : `${right}\0${left}`
}

function getEqualityPermissions(params: PatternParams): Set<string> {
  const permissions = new Set<string>()
  for (const [symbol, others] of Object.entries(params.allowSameWith ?? {})) {
    for (const other of others) permissions.add(symbolPair(symbol, other))
  }
  return permissions
}

function matchesAt(
  grid: Grid,
  pattern: string[][],
  startRow: number,
  startColumn: number,
  params: PatternParams,
  equalityPermissions: Set<string>,
): boolean {
  const bindings = new Map<string, number>()

  for (let row = 0; row < pattern.length; row++) {
    for (let column = 0; column < pattern[row]!.length; column++) {
      const token = pattern[row]![column]!
      const value = grid[startRow + row]![startColumn + column]!

      if (token === ' ') continue
      if (/^[0-9]$/.test(token)) {
        if (value !== Number(token)) return false
        continue
      }

      const boundValue = bindings.get(token)
      if (boundValue !== undefined) {
        if (boundValue !== value) return false
        continue
      }

      const allowedValues = params.symbolValues?.[token]
      if (allowedValues && !allowedValues.includes(value)) return false

      for (const [otherSymbol, otherValue] of bindings) {
        if (otherValue === value && !equalityPermissions.has(symbolPair(token, otherSymbol))) {
          return false
        }
      }

      bindings.set(token, value)
    }
  }

  return true
}

function overlapsUsedCells(
  usedCells: Set<number>,
  startRow: number,
  startColumn: number,
  height: number,
  width: number,
  gridWidth: number,
): boolean {
  for (let row = startRow; row < startRow + height; row++) {
    for (let column = startColumn; column < startColumn + width; column++) {
      if (usedCells.has(row * gridWidth + column)) return true
    }
  }
  return false
}

function markUsedCells(
  usedCells: Set<number>,
  startRow: number,
  startColumn: number,
  height: number,
  width: number,
  gridWidth: number,
): void {
  for (let row = startRow; row < startRow + height; row++) {
    for (let column = startColumn; column < startColumn + width; column++) {
      usedCells.add(row * gridWidth + column)
    }
  }
}

export function matchByPattern(grid: Grid, params: PatternParams): number {
  if (grid.length === 0 || grid[0]!.length === 0) return 0

  const gridWidth = grid[0]!.length
  const pattern = params.pattern.map((row) => Array.from(row))
  const patternHeight = pattern.length
  const patternWidth = pattern[0]?.length ?? 0

  if (patternHeight === 0 || patternWidth === 0) return 0
  if (patternHeight > grid.length || patternWidth > gridWidth) return 0

  const equalityPermissions = getEqualityPermissions(params)
  const usedCells = new Set<number>()
  let matchCount = 0

  for (let row = 0; row <= grid.length - patternHeight; row++) {
    for (let column = 0; column <= gridWidth - patternWidth; column++) {
      if (
        params.multiple &&
        params.allowOverlap === false &&
        overlapsUsedCells(usedCells, row, column, patternHeight, patternWidth, gridWidth)
      ) {
        continue
      }

      if (!matchesAt(grid, pattern, row, column, params, equalityPermissions)) continue

      matchCount++
      if (!params.multiple) return evaluateCoefficient(params.coefficient, matchCount)

      if (params.allowOverlap === false) {
        markUsedCells(usedCells, row, column, patternHeight, patternWidth, gridWidth)
      }
    }
  }

  return evaluateCoefficient(params.coefficient, matchCount)
}
