import dayjs from 'dayjs'
import { isMobile } from 'react-device-detect'
export function unixToDate(unix: number, format = 'YYYY-MM-DD'): string {
  return dayjs.unix(unix).utc().format(format)
}

export const formatTime = (unix: string, buffer?: number): string => {
  const now = dayjs()
  const timestamp = dayjs.unix(parseInt(unix)).add(buffer ?? 0, 'minute')

  const inSeconds = now.diff(timestamp, 'second')
  const inMinutes = now.diff(timestamp, 'minute')
  const inHours = now.diff(timestamp, 'hour')
  const inDays = now.diff(timestamp, 'day')

  if (inMinutes < 1) {
    return 'recently'
  }

  const minText = isMobile ? 'min' : 'minute'

  if (inHours >= 24) {
    return `${inDays} ${inDays === 1 ? 'day' : 'days'} ago`
  } else if (inMinutes >= 60) {
    return `${inHours} ${inHours === 1 ? 'hour' : 'hours'} ago`
  } else if (inSeconds >= 60) {
    return `${inMinutes} ${inMinutes === 1 ? minText : `${minText}s`} ago`
  } else {
    return `${inSeconds} ${inSeconds === 1 ? 'second' : 'seconds'} ago`
  }
}
