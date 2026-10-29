# 02 — Answer matching rules and Aliases

**Parent spec:** `.scratch/terminus-v1/spec.md`

**What to build:** The player can type Countries the way people actually write them. Matching ignores accents, punctuation and a leading "the", and every Country accepts a curated list of Aliases — short forms (USA, UK, DRC, UAE), English and native names (Ivory Coast / Côte d'Ivoire, East Timor / Timor-Leste), well-known former names (Burma, Swaziland, Czech Republic), and variants like "St"/"Saint" and "&"/"and". Spelling stays strict: misspellings and ambiguous colloquial names never count.

**Blocked by:** 01 — Type a Country, see it colored

**Status:** ready-for-agent

- [ ] Matching normalizes both input and names/Aliases: lower-case, diacritics stripped, punctuation removed, whitespace collapsed, leading "the" dropped
- [ ] "cote divoire", "Guinea Bissau", "Gambia" and "The Gambia" are all accepted
- [ ] Each Country carries a hand-curated Alias list covering short forms, English/native names, well-known former names, and St/Saint and &/and variants
- [ ] "Congo" alone Finds the Republic of the Congo; "DR Congo", "DRC", "Democratic Republic of the Congo" and "Congo-Kinshasa" Find the Democratic Republic of the Congo
- [ ] "America", "Holland" and "England" match nothing
- [ ] Misspellings such as "Brazl" match nothing (no fuzzy matching)
- [ ] After "Niger" auto-accepts mid-way through typing "Nigeria", typing "Nigeria" again Finds Nigeria
- [ ] Attempt-seam tests cover each rule above
- [ ] Data consistency test: no name or Alias normalizes to the same text as another Country's name or Alias

## Comments

**2026-10-29** — Decided during implementation: short forms that begin a longer name of the same Country (US, Bosnia, Vatican, Trinidad, Antigua) are not Aliases. Auto-accept would fire on them part-way through the full name and leave the rest of it in the answer box, so a player typing "Bosnia" just keeps typing to "Bosnia and Herzegovina" instead. Two required Aliases fire early inside another Country's name, the same quirk as Niger/Nigeria: "UK" while typing "Ukraine", and "Congo" while typing "Congo-Kinshasa" (which credits the Republic of the Congo first). Retyping Finds the intended Country; tests cover both.
