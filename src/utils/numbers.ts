import numbro from 'numbro'
import { toK } from 'utils'

// using a currency library here in case we want to add more in future
export const formatDollarAmount = (num: number | undefined, digits = 2, round = true): string => {
  if (digits < 0) digits = 0
  if (num === 0) return '$0' + (digits ? '.' : '') + '0'.repeat(digits)
  if (!num) return '-'
  const unit = 1 / 10 ** digits
  if (num < unit) {
    return '<$' + unit
  }

  return numbro(num)
    .formatCurrency({
      average: round,
      mantissa: num > 1000 ? 2 : digits,
      abbreviations: {
        million: 'M',
        billion: 'B',
      },
    })
    .toUpperCase()
}

// using a currency library here in case we want to add more in future
export const formatAmount = (num?: number, digits = 2): string => {
  if (num === 0) return '0'
  if (!num) return '-'
  const unit = 1 / 10 ** digits
  if (num < unit) {
    return '<' + unit
  }
  return numbro(num)
    .format({
      average: true,
      mantissa: num > 1000 ? 2 : digits,
      abbreviations: {
        million: 'M',
        billion: 'B',
      },
    })
    .toUpperCase()
}

const priceFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 3,
})

export const formattedNum = (number: number | string | undefined, usd = false): string => {
  let num: number
  if (typeof number === 'string') {
    num = parseFloat(number)
  } else if (typeof number === 'undefined') {
    return usd ? '$0' : '0'
  } else {
    num = number
  }
  if (isNaN(num)) {
    return usd ? '$0' : '0'
  }

  if (num > 500000000) {
    return (usd ? '$' : '') + toK(num.toFixed(0))
  }

  if (num === 0) {
    if (usd) {
      return '$0'
    }
    return '0'
  }

  if (num < 0.0001 && num > 0) {
    return usd ? '< $0.0001' : '< 0.0001'
  }

  if (num > 1000) {
    return usd
      ? '$' + Number(num.toFixed(0)).toLocaleString('en-US')
      : '' + Number(num.toFixed(0)).toLocaleString('en-US')
  }

  if (usd) {
    if (num < 0.1) {
      return '$' + Number(num.toFixed(4))
    } else {
      const usdString = priceFormatter.format(num)
      return '$' + usdString.slice(1, usdString.length)
    }
  }

  return num.toFixed(5)
}
