/*!
 * Minimal theme switcher
 *
 * Pico.css - https://picocss.com
 * Copyright 2019-2023 - Licensed under MIT
 */

const themeSwitcher = {
  // Config
  _scheme: 'light',
  buttonTarget: 'button[data-theme-switcher]',
  buttonAttribute: 'data-theme-switcher',
  rootAttribute: 'data-theme',
  localStorageKey: 'picoPreferredColorScheme',

  // Init
  init() {
    console.log('init')
    this.scheme = this.schemeFromLocalStorage
    this.initSwitchers()
  },

  // Get color scheme from local storage
  get schemeFromLocalStorage() {
    if (typeof window.localStorage !== 'undefined') {
      if (window.localStorage.getItem(this.localStorageKey) !== null) {
        return window.localStorage.getItem(this.localStorageKey) || 'light'
      }
    }
    return this._scheme
  },

  // Preferred color scheme
  get preferredColorScheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  },

  // Init switchers
  initSwitchers() {
    console.log(this.buttonTarget)
    const button = document.querySelector(this.buttonTarget)
    button?.addEventListener(
      'click',
      (event) => {
        event.preventDefault()
        // Set scheme
        this.scheme = button.getAttribute(this.buttonAttribute) || 'light'
        // Close dropdown
      },
      false
    )
  },

  // Set scheme
  set scheme(scheme: string) {
    if (scheme == 'auto') {
      this.preferredColorScheme == 'dark' ? (this._scheme = 'dark') : (this._scheme = 'light')
    } else if (scheme == 'dark' || scheme == 'light') {
      this._scheme = scheme
    }
    this.applyScheme()
    this.schemeToLocalStorage()
  },

  // Get scheme
  get scheme() {
    return this._scheme
  },

  // Apply scheme
  applyScheme() {
    document.querySelector('html')?.setAttribute(this.rootAttribute, this.scheme)
  },

  // Store scheme to local storage
  schemeToLocalStorage() {
    if (typeof window.localStorage !== 'undefined') {
      window.localStorage.setItem(this.localStorageKey, this.scheme)
    }
  }
}

// Init
export default themeSwitcher
