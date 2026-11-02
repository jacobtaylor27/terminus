import { countriesOfTheWorld } from './countriesOfTheWorld.ts'
import type { Quiz } from './quiz.ts'
import { usStateCapitals } from './usStateCapitals.ts'

// Every Quiz the player can choose, in the order the Quiz list shows them.
export const quizCatalog: readonly Quiz[] = [countriesOfTheWorld, usStateCapitals]
