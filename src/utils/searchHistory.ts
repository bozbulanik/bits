const RECENT_SEARCHES_KEY = 'recently_opened_ids'
const MAX_HISTORY = 5

export const saveBitIdToHistory = (bitId: string) => {
  let history = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]')
  history = [bitId, ...history.filter((q: string) => q !== bitId)]
  history = history.slice(0, MAX_HISTORY)
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(history))
}

export const getBitIdsFromHistory = (): string[] => {
  return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]')
}

export const clearBitsHistory = () => {
  localStorage.removeItem('recently_opened_ids')
}
