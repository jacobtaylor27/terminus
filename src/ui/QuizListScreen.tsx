import { type KeyboardEvent, useEffect, useId, useRef } from 'react'
import type { TimerSetting } from '../attempt/attempt.ts'
import { loadThumbnails, MapThumbnail } from '../map/MapThumbnail.tsx'
import type { QuizCategory } from '../quiz/catalog.ts'
import { modeDetails, type Quiz } from '../quiz/quiz.ts'
import type { AttemptRecord, Records } from '../records/records.ts'
import { MAX_STARS, starsFor } from '../records/stars.ts'
import { formatTimerTime, formatTimeTaken } from './formatDuration.ts'
import { ScoreFigure } from './ScoreFigure.tsx'
import { goalText, StarIcon, StarMeter } from './StarMeter.tsx'

// Which build this is, baked in by vite.config.ts.
declare const __APP_VERSION__: { version: string; build: number; commit: string }
const appVersion = __APP_VERSION__

const REPOSITORY_URL = 'https://github.com/jacobtaylor27/terminus'

interface QuizListScreenProps {
  categories: readonly QuizCategory[]
  records: Records
  // The Category whose tab is open, by name, kept by the caller so the player comes back to it.
  openCategory: string
  onOpenCategory: (name: string) => void
  onChoose: (quiz: Quiz) => void
}

// How far the player has got with a Quiz: its Personal Bests, and the best Score among them, which
// earns its Stars.
interface QuizProgress {
  personalBests: AttemptRecord[]
  bestScore: number
  stars: number
}

function progressOf(quiz: Quiz, records: Records): QuizProgress {
  const personalBests = records.personalBests(quiz)
  const bestScore = Math.max(0, ...personalBests.map((best) => best.score))
  return { personalBests, bestScore, stars: starsFor(bestScore, quiz.places.length) }
}

export function QuizListScreen({ categories, records, openCategory, onOpenCategory, onChoose }: QuizListScreenProps) {
  const tabsId = useId()
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const openIndex = Math.max(
    0,
    categories.findIndex((category) => category.name === openCategory),
  )
  const progressById = new Map(
    categories.flatMap((category) => category.quizzes.map((quiz) => [quiz.id, progressOf(quiz, records)] as const)),
  )
  const allProgress = [...progressById.values()]
  const starsIn = (quizzes: readonly Quiz[]) =>
    quizzes.reduce((stars, quiz) => stars + progressById.get(quiz.id)!.stars, 0)

  // Every tab's thumbnails are drawn while the first is shown, so another tab's are ready when it opens.
  useEffect(
    () => loadThumbnails(categories.flatMap((category) => category.quizzes.map((quiz) => quiz.map))),
    [categories],
  )

  // The arrow keys move between the tabs, round from the last to the first, and Home and End go to the
  // first and the last. Each tab opens as it is reached.
  function handleTabKeyDown(event: KeyboardEvent, index: number) {
    const last = categories.length - 1
    const next = (
      {
        ArrowRight: index === last ? 0 : index + 1,
        ArrowLeft: index === 0 ? last : index - 1,
        Home: 0,
        End: last,
      } as Record<string, number>
    )[event.key]
    if (next === undefined) return
    event.preventDefault()
    onOpenCategory(categories[next].name)
    tabs.current[next]?.focus()
  }

  const tabId = (index: number) => `${tabsId}-tab-${index}`
  const panelId = `${tabsId}-panel`
  const open = categories[openIndex]

  return (
    <main className="page home-page">
      <header className="home-header">
        <h1 className="app-title">Terminus</h1>
        <p className="app-tagline">A geography quiz on a map. Name every place you can to earn stars.</p>
        <p className="player-stats">
          <span className="player-stat">
            <StarIcon earned />
            {allProgress.reduce((stars, progress) => stars + progress.stars, 0)} of {allProgress.length * MAX_STARS}{' '}
            stars
          </span>
          <span className="player-stat">
            {allProgress.filter((progress) => progress.personalBests.length > 0).length} of {allProgress.length}{' '}
            Quizzes played
          </span>
        </p>
      </header>
      {/* Each Category is a tab: its name in the serif, with the Stars earned in it. */}
      <div className="category-tabs" role="tablist" aria-label="Categories">
        {categories.map((category, index) => {
          const selected = index === openIndex
          return (
            <button
              key={category.name}
              ref={(tab) => {
                tabs.current[index] = tab
              }}
              id={tabId(index)}
              type="button"
              role="tab"
              className="category-tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => onOpenCategory(category.name)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              <span className="category-tab-name">{category.name}</span>{' '}
              <span className="category-stars">
                <StarIcon earned />
                {starsIn(category.quizzes)} of {category.quizzes.length * MAX_STARS}
                <span className="visually-hidden"> stars</span>
              </span>
            </button>
          )
        })}
      </div>
      <section id={panelId} role="tabpanel" aria-labelledby={tabId(openIndex)}>
        <ul className="quiz-list">
          {open.quizzes.map((quiz) => (
            <li key={quiz.id}>
              <QuizCard quiz={quiz} progress={progressById.get(quiz.id)!} onChoose={onChoose} />
            </li>
          ))}
        </ul>
      </section>
      <footer className="app-version">
        <a href={`${REPOSITORY_URL}/commit/${appVersion.commit}`} title={`Commit ${appVersion.commit.slice(0, 7)}`}>
          v{appVersion.version} ({appVersion.build})
        </a>
      </footer>
    </main>
  )
}

interface QuizCardProps {
  quiz: Quiz
  progress: QuizProgress
  onChoose: (quiz: Quiz) => void
}

// A Quiz's map thumbnail and title, then at its foot the Star meter, the goal for the next Star, and
// its Personal Bests. A Quiz with every Star earned is edged in ochre, the colour of awards. The whole
// card chooses the Quiz, but only its title is the button, so a screen reader announces the title
// alone and reads the rest as the button's description.
function QuizCard({ quiz, progress, onChoose }: QuizCardProps) {
  const id = useId()
  const meterId = `${id}-meter`
  const goalId = `${id}-goal`
  const bestsId = `${id}-bests`
  const played = progress.personalBests.length > 0
  const total = quiz.places.length
  const complete = progress.stars === MAX_STARS
  return (
    <div className={complete ? 'quiz-card complete' : 'quiz-card'}>
      <MapThumbnail quiz={quiz} />
      <h3 className="quiz-title">
        <button
          type="button"
          className="quiz-card-button"
          aria-describedby={[meterId, goalId, ...(played ? [bestsId] : [])].join(' ')}
          onClick={() => onChoose(quiz)}
        >
          {quiz.title}
        </button>
      </h3>
      <div className="quiz-progress">
        <StarMeter id={meterId} score={progress.bestScore} total={total} />
        <p id={goalId} className="quiz-goal">
          {goalText(progress.bestScore, total)}
        </p>
        {played && <PersonalBests id={bestsId} quiz={quiz} personalBests={progress.personalBests} />}
      </div>
    </div>
  )
}

interface PersonalBestsProps {
  id: string
  quiz: Quiz
  personalBests: AttemptRecord[]
}

// The Quiz's Personal Best for each setting it has one for, each its Timer setting beside its figure.
// A Quiz that can be played in more than one Mode groups them under each Mode's name, so a setting's
// name stays short enough to share a line with its figure.
function PersonalBests({ id, quiz, personalBests }: PersonalBestsProps) {
  const modesPlayed = quiz.modes.filter((mode) => personalBests.some((best) => best.mode === mode))
  return (
    <div id={id} className="quiz-bests">
      {modesPlayed.map((mode) => (
        <div key={mode} className="quiz-best-group">
          {quiz.modes.length > 1 && <p className="quiz-best-mode">{modeDetails[mode].name}</p>}
          <dl className="quiz-best-list">
            {personalBests
              .filter((best) => best.mode === mode)
              .map((best) => (
                <div key={String(best.timerMs)} className="quiz-best">
                  <dt>{timerName(best.timerMs)}</dt>
                  <dd>
                    <ScoreFigure score={best.score} total={best.total} />
                    <span className="quiz-best-time">
                      {' '}
                      in {formatTimeTaken(best.elapsedMs, best.timerMs !== null)}
                    </span>
                  </dd>
                </div>
              ))}
          </dl>
        </div>
      ))}
    </div>
  )
}

// The Timer setting a Personal Best is for: "Timer off" or "15:00 Timer".
function timerName(timerMs: TimerSetting): string {
  return timerMs === null ? 'Timer off' : `${formatTimerTime(timerMs)} Timer`
}
