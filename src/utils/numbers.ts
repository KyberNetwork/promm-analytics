import numbro from 'numbro'

// using a currency library here in case we want to add more in future
export const formatDollarAmount = (num: number | undefined, digits = 2, round = true): string => {
  if (digits < 0) digits = 0
  if (num === 0) return '$0' + (digits ? '.' : '') + '0'.repeat(digits)
  if (!num) return '-'
  const unit = 1 / 10 ** digits
  if (num < unit) {
    return '<$' + unit
  }

  return numbro(num).formatCurrency({
    average: round,
    mantissa: num > 1000 ? 2 : digits,
    abbreviations: {
      million: 'M',
      billion: 'B',
    },
  })
}

// using a currency library here in case we want to add more in future
export const formatAmount = (num?: number, digits = 2): string => {
  if (num === 0) return '0'
  if (!num) return '-'
  const unit = 1 / 10 ** digits
  if (num < unit) {
    return '<' + unit
  }
  return numbro(num).format({
    average: true,
    mantissa: num > 1000 ? 2 : digits,
    abbreviations: {
      million: 'M',
      billion: 'B',
    },
  })
}
