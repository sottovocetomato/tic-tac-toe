const setItem = (name: string, data: string | [] | number | {}) => {
  if (!data || !name) throw new Error('Not enough arguments for localStorage setItem')
  localStorage.setItem(name, JSON.stringify(data))
}
const getItem = (name: string) => {
  if (!name) throw new Error('Name for localStorage getItem is not provided')
  const item = localStorage.getItem(name)
  if (item) return JSON.parse(item)
}

export { setItem, getItem }
