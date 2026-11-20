import { describe, expect, it } from 'vitest'
import { startAttempt } from '../attempt/attempt.ts'
import {
  capitalsOfAfrica,
  capitalsOfAsia,
  capitalsOfEurope,
  capitalsOfNorthAmerica,
  capitalsOfOceania,
  capitalsOfSouthAmerica,
  capitalsOfTheWorld,
} from './capitalsOfTheContinents.ts'
import { type Continent, countryIdsByContinent } from './countriesOfTheContinents.ts'
import { countriesOfTheWorld } from './countriesOfTheWorld.ts'
import { acceptedNames, type Quiz } from './quiz.ts'

// Each continent capitals Quiz, with the Continent it is for.
const capitalsQuizzes: [Continent, Quiz][] = [
  ['africa', capitalsOfAfrica],
  ['asia', capitalsOfAsia],
  ['europe', capitalsOfEurope],
  ['north-america', capitalsOfNorthAmerica],
  ['oceania', capitalsOfOceania],
  ['south-america', capitalsOfSouthAmerica],
]

// What a new Free Recall Attempt at the Quiz makes of the text typed into its answer box.
const typed = (quiz: Quiz, text: string) => startAttempt(quiz, 'free-recall', () => 0).inputChanged(text)

describe('the capitals of the World', () => {
  it('give every Country of the World one capital, joined to its shape by its id', () => {
    const capitalIds = capitalsOfTheWorld.map((capital) => capital.id)

    expect(capitalIds).toEqual(countriesOfTheWorld.places.map((country) => country.id))
  })

  it("ask for each capital by its Country's name", () => {
    const prompts = capitalsOfTheWorld.map((capital) => capital.prompt)

    expect(prompts).toEqual(countriesOfTheWorld.places.map((country) => country.name))
  })
})

describe.each(capitalsQuizzes)('the capitals Quiz of %s', (continent, quiz) => {
  it("asks for the capital of each of the Continent's Countries", () => {
    const ids = quiz.places.map((place) => place.id)

    expect([...ids].sort()).toEqual([...countryIdsByContinent[continent]].sort())
  })

  it("is played in Free Recall and Cued Recall, with 'Capital of' over each Prompt, on its Continent's map", () => {
    expect(quiz.modes).toEqual(['free-recall', 'cued-recall'])
    expect(quiz.promptLabel).toBe('Capital of')
    expect(quiz.map).toBe(continent)
  })

  it('lets every name and Alias Find its own capital, so none is shared with another', () => {
    const namesNotFindingTheirCapital = quiz.places.flatMap((place) =>
      acceptedNames(place).filter((name) => {
        const result = typed(quiz, name)
        return result.kind !== 'accepted' || result.place !== place
      }),
    )

    expect(namesNotFindingTheirCapital).toEqual([])
  })

  it("never Finds another capital part-way through typing one's name", () => {
    const namesFindingAnother = quiz.places.flatMap((place) =>
      acceptedNames(place).filter((name) => {
        const attempt = startAttempt(quiz, 'free-recall', () => 0)
        for (let length = 1; length <= name.length; length++) {
          const result = attempt.inputChanged(name.slice(0, length))
          if (result.kind === 'accepted') return result.place !== place
        }
        return true
      }),
    )

    expect(namesFindingAnother).toEqual([])
  })
})

describe('the capitals Quizzes', () => {
  it.each([
    ['Pretoria', 'South Africa'],
    ['Cape Town', 'South Africa'],
    ['Bloemfontein', 'South Africa'],
    ['Abidjan', "Côte d'Ivoire"],
    ['Putrajaya', 'Malaysia'],
    ['Colombo', 'Sri Lanka'],
    ['The Hague', 'Netherlands'],
    ['Hague', 'Netherlands'],
    ['La Paz', 'Bolivia'],
    ['Sucre', 'Bolivia'],
    ['Washington', 'United States'],
    ['Washington, D.C.', 'United States'],
    ['St. John’s', 'Antigua and Barbuda'],
    ['Kiev', 'Ukraine'],
  ])('accept %s for the capital of %s', (text, countryName) => {
    const quiz = capitalsQuizzes.map(([, quiz]) => quiz).find((quiz) => quiz.places.some((p) => p.prompt === countryName))!

    const result = typed(quiz, text)

    expect(result.kind === 'accepted' && result.place.prompt).toBe(countryName)
  })

  it("make a Country's name a Wrong Guess on Enter, when it isn't also its capital's", () => {
    const attempt = startAttempt(capitalsOfAfrica, 'free-recall', () => 0)

    expect(attempt.inputChanged('Kenya').kind).toBe('no-match')
    expect(attempt.commit('Kenya').kind).toBe('wrong-guess')
  })

  it('prompt Cued Recall with a Country of the Continent', () => {
    const prompt = startAttempt(capitalsOfOceania, 'cued-recall', () => 0, null, () => 0).state().prompt

    expect(countryIdsByContinent.oceania).toContain(prompt?.id)
    expect(prompt?.prompt).toBe(countriesOfTheWorld.places.find((country) => country.id === prompt?.id)?.name)
  })
})
