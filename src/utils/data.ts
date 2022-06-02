/**
 * gets the amoutn difference plus the % change in change itself (second order change)
 * @param {*} totalValueNow
 * @param {*} totalValue24HoursAgo
 * @param {*} totalValue48HoursAgo
 */
export const get2DayChange = (
  totalValueNow: string | number | undefined,
  totalValue24HoursAgo: string | number | undefined,
  totalValue48HoursAgo: string | number | undefined
): [number, number] => {
  if (typeof totalValueNow == 'undefined') totalValueNow = 0
  if (typeof totalValue24HoursAgo == 'undefined') totalValue24HoursAgo = 0
  if (typeof totalValue48HoursAgo == 'undefined') totalValue48HoursAgo = 0

  if (typeof totalValueNow == 'string') totalValueNow = parseFloat(totalValueNow)
  if (typeof totalValue24HoursAgo == 'string') totalValue24HoursAgo = parseFloat(totalValue24HoursAgo)
  if (typeof totalValue48HoursAgo == 'string') totalValue48HoursAgo = parseFloat(totalValue48HoursAgo)

  // get volume info for both 24 hour periods
  const currentChange = totalValueNow - totalValue24HoursAgo
  const previousChange = totalValue24HoursAgo - totalValue48HoursAgo
  const adjustedPercentChange = ((currentChange - previousChange) / previousChange) * 100
  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return [currentChange, 0]
  }
  return [currentChange, adjustedPercentChange]
}

/**
 * get standard percent change between two values
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 */
export const getPercentChange = (valueNow: string | undefined, value24HoursAgo: string | undefined): number => {
  if (valueNow && value24HoursAgo) {
    const change = ((parseFloat(valueNow) - parseFloat(value24HoursAgo)) / parseFloat(value24HoursAgo)) * 100
    if (isFinite(change)) return change
  }
  return 0
}
