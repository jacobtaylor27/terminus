import { countriesOfTheWorld } from './countriesOfTheWorld.ts'
import type { Quiz } from './quiz.ts'

// The six Continents Terminus groups the Countries into, each with a Quiz of its own.
export type Continent = 'africa' | 'asia' | 'europe' | 'north-america' | 'oceania' | 'south-america'

// The Countries of each Continent, by their ids in Countries of the World. This is the one place a
// Country's Continent is decided. Each Country is in exactly one, so the six add up to the 197. A
// Country that spans two is in the one most quizzes put it in: Russia and Cyprus in Europe; Turkey,
// Kazakhstan, Georgia, Armenia and Azerbaijan in Asia; Egypt in Africa. Central America and the
// Caribbean are in North America.
export const countryIdsByContinent: Record<Continent, readonly string[]> = {
  africa: [
    'DZA', 'AGO', 'BEN', 'BWA', 'BFA', 'BDI', 'CPV', 'CMR', 'CAF', 'TCD', 'COM', 'COD', 'COG', 'CIV',
    'DJI', 'EGY', 'GNQ', 'ERI', 'SWZ', 'ETH', 'GAB', 'GMB', 'GHA', 'GIN', 'GNB', 'KEN', 'LSO', 'LBR',
    'LBY', 'MDG', 'MWI', 'MLI', 'MRT', 'MUS', 'MAR', 'MOZ', 'NAM', 'NER', 'NGA', 'RWA', 'STP', 'SEN',
    'SYC', 'SLE', 'SOM', 'ZAF', 'SDS', 'SDN', 'TZA', 'TGO', 'TUN', 'UGA', 'ZMB', 'ZWE',
  ],
  asia: [
    'AFG', 'ARM', 'AZE', 'BHR', 'BGD', 'BTN', 'BRN', 'KHM', 'CHN', 'GEO', 'IND', 'IDN', 'IRN', 'IRQ',
    'ISR', 'JPN', 'JOR', 'KAZ', 'KWT', 'KGZ', 'LAO', 'LBN', 'MYS', 'MDV', 'MNG', 'MMR', 'NPL', 'PRK',
    'OMN', 'PAK', 'PSX', 'PHL', 'QAT', 'SAU', 'SGP', 'KOR', 'LKA', 'SYR', 'TWN', 'TJK', 'THA', 'TLS',
    'TUR', 'TKM', 'ARE', 'UZB', 'VNM', 'YEM',
  ],
  europe: [
    'ALB', 'AND', 'AUT', 'BLR', 'BEL', 'BIH', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 'FRA',
    'DEU', 'GRC', 'HUN', 'ISL', 'IRL', 'ITA', 'KOS', 'LVA', 'LIE', 'LTU', 'LUX', 'MLT', 'MDA', 'MCO',
    'MNE', 'NLD', 'MKD', 'NOR', 'POL', 'PRT', 'ROU', 'RUS', 'SMR', 'SRB', 'SVK', 'SVN', 'ESP', 'SWE',
    'CHE', 'UKR', 'GBR', 'VAT',
  ],
  'north-america': [
    'ATG', 'BHS', 'BRB', 'BLZ', 'CAN', 'CRI', 'CUB', 'DMA', 'DOM', 'SLV', 'GRD', 'GTM', 'HTI', 'HND',
    'JAM', 'MEX', 'NIC', 'PAN', 'KNA', 'LCA', 'VCT', 'TTO', 'USA',
  ],
  oceania: ['AUS', 'FJI', 'KIR', 'MHL', 'FSM', 'NRU', 'NZL', 'PLW', 'PNG', 'WSM', 'SLB', 'TON', 'TUV', 'VUT'],
  'south-america': ['ARG', 'BOL', 'BRA', 'CHL', 'COL', 'ECU', 'GUY', 'PRY', 'PER', 'SUR', 'URY', 'VEN'],
}

// Each Continent's name, as Quiz titles show it.
export const continentNames: Record<Continent, string> = {
  africa: 'Africa',
  asia: 'Asia',
  europe: 'Europe',
  'north-america': 'North America',
  oceania: 'Oceania',
  'south-america': 'South America',
}

// The Quiz of the Continent's Countries, played on its own map. Its Places are Countries of the
// World's own, so each Country's name and Aliases are kept in one place.
function countriesOf(continent: Continent): Quiz {
  const ids = new Set(countryIdsByContinent[continent])
  return {
    id: `countries-of-${continent}`,
    title: `Countries of ${continentNames[continent]}`,
    modes: ['free-recall'],
    map: continent,
    places: countriesOfTheWorld.places.filter((place) => ids.has(place.id)),
  }
}

export const countriesOfAfrica = countriesOf('africa')
export const countriesOfAsia = countriesOf('asia')
export const countriesOfEurope = countriesOf('europe')
export const countriesOfNorthAmerica = countriesOf('north-america')
export const countriesOfOceania = countriesOf('oceania')
export const countriesOfSouthAmerica = countriesOf('south-america')
