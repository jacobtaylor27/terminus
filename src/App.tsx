import { countriesOfTheWorld } from './quiz/countriesOfTheWorld.ts'
import { AttemptScreen } from './ui/AttemptScreen.tsx'

export function App() {
  return <AttemptScreen quiz={countriesOfTheWorld} mode="free-recall" />
}
