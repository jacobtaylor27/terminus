import { canadianCapitals } from './canadianCapitals.ts'
import {
  capitalsOfAfrica,
  capitalsOfAsia,
  capitalsOfEurope,
  capitalsOfNorthAmerica,
  capitalsOfOceania,
  capitalsOfSouthAmerica,
} from './capitalsOfTheContinents.ts'
import {
  countriesOfAfrica,
  countriesOfAsia,
  countriesOfEurope,
  countriesOfNorthAmerica,
  countriesOfOceania,
  countriesOfSouthAmerica,
} from './countriesOfTheContinents.ts'
import { countriesOfTheWorld } from './countriesOfTheWorld.ts'
import type { Quiz } from './quiz.ts'
import { usStateCapitals } from './usStateCapitals.ts'

// A heading the Quiz list groups Quizzes under, by what they ask the player to name.
export interface QuizCategory {
  name: string
  quizzes: readonly Quiz[]
}

// Every Quiz the player can choose, under its Category, in the order the Quiz list shows them.
export const quizCatalog: readonly QuizCategory[] = [
  {
    name: 'Countries',
    quizzes: [
      countriesOfTheWorld,
      countriesOfAfrica,
      countriesOfAsia,
      countriesOfEurope,
      countriesOfNorthAmerica,
      countriesOfOceania,
      countriesOfSouthAmerica,
    ],
  },
  {
    name: 'Capitals',
    quizzes: [
      capitalsOfAfrica,
      capitalsOfAsia,
      capitalsOfEurope,
      capitalsOfNorthAmerica,
      capitalsOfOceania,
      capitalsOfSouthAmerica,
      usStateCapitals,
      canadianCapitals,
    ],
  },
]
