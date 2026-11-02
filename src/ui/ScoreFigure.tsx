interface ScoreFigureProps {
  score: number
  total: number
}

// A Score shown as a figure: the number Found in the serif, then a smaller, muted "/total", so the
// number Found stands out. It takes its size from where it's shown.
export function ScoreFigure({ score, total }: ScoreFigureProps) {
  return (
    <span className="score-figure">
      {score}
      <span className="score-total">/{total}</span>
    </span>
  )
}
