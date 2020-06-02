import { ContestPeriod } from './types'

export function getContestPeriod(date: moment.Moment): ContestPeriod {
  const fullLabel = date.format('WW-YYYY')
  const [week, year] = fullLabel.split('-').map((n) => parseInt(n))
  return {
    week,
    year,
    fullLabel,
  }
}
