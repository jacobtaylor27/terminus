import type { Quiz } from './quiz.ts'

// Each capital's id is its Province's postal code, which joins it to the Province's map shape, and its
// prompt is the Province's name. The 10 provinces come first, then the 3 territories.
//
// Aliases follow US State Capitals' rules: hand-curated and few, and no short form that begins the
// capital's own name. So "Quebec", which is also the city's French name, is left out: it would
// auto-accept part-way through "Quebec City", and it is the Province's own name, which is never an
// answer. "Saint John's" is accepted for St. John's, as "St Paul" is for Saint Paul; Saint John, New
// Brunswick's largest city, is not its capital and stays a Wrong Guess.
export const canadianCapitals: Quiz = {
  id: 'canadian-capitals',
  title: 'Canadian Capitals',
  modes: ['free-recall', 'cued-recall'],
  map: 'canada',
  promptLabel: 'Capital of',
  places: [
    { id: 'AB', name: 'Edmonton', prompt: 'Alberta' },
    { id: 'BC', name: 'Victoria', prompt: 'British Columbia' },
    { id: 'MB', name: 'Winnipeg', prompt: 'Manitoba' },
    { id: 'NB', name: 'Fredericton', prompt: 'New Brunswick' },
    { id: 'NL', name: "St. John's", aliases: ["Saint John's"], prompt: 'Newfoundland and Labrador' },
    { id: 'NS', name: 'Halifax', prompt: 'Nova Scotia' },
    { id: 'ON', name: 'Toronto', prompt: 'Ontario' },
    { id: 'PE', name: 'Charlottetown', prompt: 'Prince Edward Island' },
    { id: 'QC', name: 'Quebec City', prompt: 'Quebec' },
    { id: 'SK', name: 'Regina', prompt: 'Saskatchewan' },
    { id: 'NT', name: 'Yellowknife', prompt: 'Northwest Territories' },
    { id: 'NU', name: 'Iqaluit', prompt: 'Nunavut' },
    { id: 'YT', name: 'Whitehorse', prompt: 'Yukon' },
  ],
}
