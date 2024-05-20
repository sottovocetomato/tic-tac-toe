import { ref } from 'vue'

const _scheme = ref<string>('light')
const buttonTarget = 'button[data-theme-switcher]'
const buttonAttribute = 'data-theme-switcher'
const rootAttribute = 'data-theme'
const localStorageKey = 'picoPreferredColorScheme'

export default function useThemeSwitch() {
  // Init
  const init = () => {
    setScheme(schemeFromLocalStorage() as string)
    initSwitchers()
  }

  // Get color scheme from local storage
  const schemeFromLocalStorage = () => {
    if (typeof window?.localStorage !== 'undefined') {
      if (window?.localStorage?.getItem(localStorageKey) !== null) {
        return window?.localStorage?.getItem(localStorageKey)
      }
    }
    return _scheme.value
  }

  // Preferred color scheme
  const preferredColorScheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Init switchers
  const initSwitchers = () => {
    const button = document.querySelector<HTMLButtonElement>(buttonTarget)
    button?.addEventListener(
      'click',
      (event) => {
        event.preventDefault()
        // Set scheme
        const theme = _scheme.value === 'light' ? 'dark' : 'light'
        setScheme(theme)
      },
      false
    )
  }

  // Set scheme
  const setScheme = (scheme: string) => {
    if (scheme == 'dark' || scheme == 'light') {
      _scheme.value = scheme
    }
    applyScheme()
    schemeToLocalStorage()
  }

  // Get scheme
  const getScheme = () => {
    return _scheme.value
  }

  // Apply scheme
  const applyScheme = () => {
    document.querySelector('html')?.setAttribute(rootAttribute, getScheme())
  }

  // Store scheme to local storage
  const schemeToLocalStorage = () => {
    if (typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem(localStorageKey, getScheme())
    }
  }
  return { init, getScheme }
}
