import { type Continent, continentNames, countryIdsByContinent } from './countriesOfTheContinents.ts'
import { countriesOfTheWorld } from './countriesOfTheWorld.ts'
import type { Place, Quiz } from './quiz.ts'

// A Country's capital: the name shown for it, and the other texts accepted for it.
type Capital = Pick<Place, 'name' | 'aliases'>

// Each Country's capital, by the Country's id in Countries of the World, which joins it to the
// Country's shape.
//
// A Country with more than one capital, or whose government sits outside its capital, accepts each of
// those cities as an Alias, and its constitutional capital is the name shown: Pretoria, with Cape Town
// and Bloemfontein accepted. A planned new capital is accepted too (Nusantara, Ciudad de la Paz).
//
// Other Aliases follow Countries of the World's rules: hand-curated and few, with no ambiguous
// colloquial names, and no short form that begins its own longer name ("Kuwait", "Djibouti City",
// "Berne"), since it would auto-accept part-way through typing the full name. "Washington" is the one
// exception: it is how most people name the capital, so it is accepted though it begins "Washington,
// D.C.".
const capitalsByCountryId: Record<string, Capital> = {
  // Africa
  DZA: { name: 'Algiers' },
  AGO: { name: 'Luanda' },
  BEN: { name: 'Porto-Novo', aliases: ['Cotonou'] },
  BWA: { name: 'Gaborone' },
  BFA: { name: 'Ouagadougou' },
  BDI: { name: 'Gitega', aliases: ['Bujumbura'] },
  CPV: { name: 'Praia' },
  CMR: { name: 'Yaoundé' },
  CAF: { name: 'Bangui' },
  TCD: { name: "N'Djamena" },
  COM: { name: 'Moroni' },
  COD: { name: 'Kinshasa' },
  COG: { name: 'Brazzaville' },
  CIV: { name: 'Yamoussoukro', aliases: ['Abidjan'] },
  DJI: { name: 'Djibouti' },
  EGY: { name: 'Cairo' },
  GNQ: { name: 'Malabo', aliases: ['Ciudad de la Paz'] },
  ERI: { name: 'Asmara' },
  SWZ: { name: 'Mbabane', aliases: ['Lobamba'] },
  ETH: { name: 'Addis Ababa' },
  GAB: { name: 'Libreville' },
  GMB: { name: 'Banjul' },
  GHA: { name: 'Accra' },
  GIN: { name: 'Conakry' },
  GNB: { name: 'Bissau' },
  KEN: { name: 'Nairobi' },
  LSO: { name: 'Maseru' },
  LBR: { name: 'Monrovia' },
  LBY: { name: 'Tripoli' },
  MDG: { name: 'Antananarivo' },
  MWI: { name: 'Lilongwe' },
  MLI: { name: 'Bamako' },
  MRT: { name: 'Nouakchott' },
  MUS: { name: 'Port Louis' },
  MAR: { name: 'Rabat' },
  MOZ: { name: 'Maputo' },
  NAM: { name: 'Windhoek' },
  NER: { name: 'Niamey' },
  NGA: { name: 'Abuja' },
  RWA: { name: 'Kigali' },
  STP: { name: 'São Tomé' },
  SEN: { name: 'Dakar' },
  SYC: { name: 'Victoria' },
  SLE: { name: 'Freetown' },
  SOM: { name: 'Mogadishu' },
  ZAF: { name: 'Pretoria', aliases: ['Cape Town', 'Bloemfontein'] },
  SDS: { name: 'Juba' },
  SDN: { name: 'Khartoum' },
  TZA: { name: 'Dodoma' },
  TGO: { name: 'Lomé' },
  TUN: { name: 'Tunis' },
  UGA: { name: 'Kampala' },
  ZMB: { name: 'Lusaka' },
  ZWE: { name: 'Harare' },

  // Asia
  AFG: { name: 'Kabul' },
  ARM: { name: 'Yerevan' },
  AZE: { name: 'Baku' },
  BHR: { name: 'Manama' },
  BGD: { name: 'Dhaka' },
  BTN: { name: 'Thimphu' },
  BRN: { name: 'Bandar Seri Begawan' },
  KHM: { name: 'Phnom Penh' },
  CHN: { name: 'Beijing', aliases: ['Peking'] },
  GEO: { name: 'Tbilisi' },
  IND: { name: 'New Delhi', aliases: ['Delhi'] },
  IDN: { name: 'Jakarta', aliases: ['Nusantara'] },
  IRN: { name: 'Tehran', aliases: ['Teheran'] },
  IRQ: { name: 'Baghdad' },
  ISR: { name: 'Jerusalem' },
  JPN: { name: 'Tokyo' },
  JOR: { name: 'Amman' },
  KAZ: { name: 'Astana', aliases: ['Nur-Sultan'] },
  KWT: { name: 'Kuwait City' },
  KGZ: { name: 'Bishkek' },
  LAO: { name: 'Vientiane' },
  LBN: { name: 'Beirut' },
  MYS: { name: 'Kuala Lumpur', aliases: ['Putrajaya'] },
  MDV: { name: 'Malé' },
  MNG: { name: 'Ulaanbaatar', aliases: ['Ulan Bator'] },
  MMR: { name: 'Naypyidaw', aliases: ['Nay Pyi Taw', 'Naypyitaw'] },
  NPL: { name: 'Kathmandu' },
  PRK: { name: 'Pyongyang' },
  OMN: { name: 'Muscat' },
  PAK: { name: 'Islamabad' },
  PSX: { name: 'East Jerusalem', aliases: ['Ramallah'] },
  PHL: { name: 'Manila' },
  QAT: { name: 'Doha' },
  SAU: { name: 'Riyadh' },
  SGP: { name: 'Singapore' },
  KOR: { name: 'Seoul' },
  LKA: { name: 'Sri Jayawardenepura Kotte', aliases: ['Kotte', 'Colombo'] },
  SYR: { name: 'Damascus' },
  TWN: { name: 'Taipei' },
  TJK: { name: 'Dushanbe' },
  THA: { name: 'Bangkok' },
  TLS: { name: 'Dili' },
  TUR: { name: 'Ankara' },
  TKM: { name: 'Ashgabat', aliases: ['Ashkhabad'] },
  ARE: { name: 'Abu Dhabi' },
  UZB: { name: 'Tashkent' },
  VNM: { name: 'Hanoi' },
  YEM: { name: "Sana'a", aliases: ['Aden'] },

  // Europe
  ALB: { name: 'Tirana' },
  AND: { name: 'Andorra la Vella' },
  AUT: { name: 'Vienna', aliases: ['Wien'] },
  BLR: { name: 'Minsk' },
  BEL: { name: 'Brussels', aliases: ['Bruxelles'] },
  BIH: { name: 'Sarajevo' },
  BGR: { name: 'Sofia' },
  HRV: { name: 'Zagreb' },
  CYP: { name: 'Nicosia' },
  CZE: { name: 'Prague', aliases: ['Praha'] },
  DNK: { name: 'Copenhagen' },
  EST: { name: 'Tallinn' },
  FIN: { name: 'Helsinki' },
  FRA: { name: 'Paris' },
  DEU: { name: 'Berlin' },
  GRC: { name: 'Athens' },
  HUN: { name: 'Budapest' },
  ISL: { name: 'Reykjavík' },
  IRL: { name: 'Dublin' },
  ITA: { name: 'Rome', aliases: ['Roma'] },
  KOS: { name: 'Pristina', aliases: ['Prishtina'] },
  LVA: { name: 'Riga' },
  LIE: { name: 'Vaduz' },
  LTU: { name: 'Vilnius' },
  LUX: { name: 'Luxembourg' },
  MLT: { name: 'Valletta' },
  MDA: { name: 'Chișinău' },
  MCO: { name: 'Monaco' },
  MNE: { name: 'Podgorica', aliases: ['Cetinje'] },
  NLD: { name: 'Amsterdam', aliases: ['The Hague', 'Den Haag'] },
  MKD: { name: 'Skopje' },
  NOR: { name: 'Oslo' },
  POL: { name: 'Warsaw', aliases: ['Warszawa'] },
  PRT: { name: 'Lisbon', aliases: ['Lisboa'] },
  ROU: { name: 'Bucharest' },
  RUS: { name: 'Moscow' },
  SMR: { name: 'San Marino' },
  SRB: { name: 'Belgrade' },
  SVK: { name: 'Bratislava' },
  SVN: { name: 'Ljubljana' },
  ESP: { name: 'Madrid' },
  SWE: { name: 'Stockholm' },
  CHE: { name: 'Bern' },
  UKR: { name: 'Kyiv', aliases: ['Kiev'] },
  GBR: { name: 'London' },
  VAT: { name: 'Vatican City' },

  // North America
  ATG: { name: "Saint John's", aliases: ["St John's"] },
  BHS: { name: 'Nassau' },
  BRB: { name: 'Bridgetown' },
  BLZ: { name: 'Belmopan' },
  CAN: { name: 'Ottawa' },
  CRI: { name: 'San José' },
  CUB: { name: 'Havana', aliases: ['La Habana'] },
  DMA: { name: 'Roseau' },
  DOM: { name: 'Santo Domingo' },
  SLV: { name: 'San Salvador' },
  GRD: { name: "Saint George's", aliases: ["St George's"] },
  GTM: { name: 'Guatemala City' },
  HTI: { name: 'Port-au-Prince' },
  HND: { name: 'Tegucigalpa' },
  JAM: { name: 'Kingston' },
  MEX: { name: 'Mexico City', aliases: ['Ciudad de México'] },
  NIC: { name: 'Managua' },
  PAN: { name: 'Panama City' },
  KNA: { name: 'Basseterre' },
  LCA: { name: 'Castries' },
  VCT: { name: 'Kingstown' },
  TTO: { name: 'Port of Spain' },
  USA: { name: 'Washington, D.C.', aliases: ['Washington'] },

  // Oceania
  AUS: { name: 'Canberra' },
  FJI: { name: 'Suva' },
  KIR: { name: 'South Tarawa', aliases: ['Tarawa'] },
  MHL: { name: 'Majuro' },
  FSM: { name: 'Palikir' },
  NRU: { name: 'Yaren' },
  NZL: { name: 'Wellington' },
  PLW: { name: 'Ngerulmud', aliases: ['Melekeok'] },
  PNG: { name: 'Port Moresby' },
  WSM: { name: 'Apia' },
  SLB: { name: 'Honiara' },
  TON: { name: "Nuku'alofa" },
  TUV: { name: 'Funafuti' },
  VUT: { name: 'Port Vila' },

  // South America
  ARG: { name: 'Buenos Aires' },
  BOL: { name: 'Sucre', aliases: ['La Paz'] },
  BRA: { name: 'Brasília' },
  CHL: { name: 'Santiago' },
  COL: { name: 'Bogotá' },
  ECU: { name: 'Quito' },
  GUY: { name: 'Georgetown' },
  PRY: { name: 'Asunción' },
  PER: { name: 'Lima' },
  SUR: { name: 'Paramaribo' },
  URY: { name: 'Montevideo' },
  VEN: { name: 'Caracas' },
}

// Every Country's capital, as a Place: joined to the Country's shape by its id, and asked for in Cued
// Recall by the Country's name.
export const capitalsOfTheWorld: readonly Place[] = countriesOfTheWorld.places.map((country) => {
  const capital = capitalsByCountryId[country.id]
  if (!capital) throw new Error(`No capital is listed for ${country.name}`)
  return { id: country.id, prompt: country.name, ...capital }
})

// The Quiz of the Continent's capitals, played on its own map, in Free Recall or Cued Recall.
function capitalsOf(continent: Continent): Quiz {
  const ids = new Set(countryIdsByContinent[continent])
  return {
    id: `capitals-of-${continent}`,
    title: `Capitals of ${continentNames[continent]}`,
    modes: ['free-recall', 'cued-recall'],
    map: continent,
    promptLabel: 'Capital of',
    places: capitalsOfTheWorld.filter((capital) => ids.has(capital.id)),
  }
}

export const capitalsOfAfrica = capitalsOf('africa')
export const capitalsOfAsia = capitalsOf('asia')
export const capitalsOfEurope = capitalsOf('europe')
export const capitalsOfNorthAmerica = capitalsOf('north-america')
export const capitalsOfOceania = capitalsOf('oceania')
export const capitalsOfSouthAmerica = capitalsOf('south-america')
