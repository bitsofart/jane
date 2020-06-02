import Color from 'color'

const palette = [
  '#32213a',
  '#383b53',
  '#66717e',
  '#d4d6b9',
  '#d1caa1',
  '#cadbc0',
  '#c94277',
  '#a27e6f',
  '#94524a',
  '#820263',
]

const weeks = [...Array(52).keys()].map((zeroIndexed) => zeroIndexed + 1)

function getColor(weekNumber: number): string {
  const colorIndex = weekNumber % 10
  return palette[colorIndex]
}
export const colors: string[] = weeks.map((weekNumber): string => {
  if (weekNumber === 1) {
    return '#221627'
  }

  if (weekNumber === 52) {
    return '#FB0EC0'
  }

  const color = getColor(weekNumber)
  return Color(color).hex().substring(1, 7)
})
