import { atom } from 'nanostores'

// Mobile off-canvas navigation drawer.
export const $mobileNavOpen = atom(false)
export const setMobileNavOpen = (open: boolean) => $mobileNavOpen.set(open)
