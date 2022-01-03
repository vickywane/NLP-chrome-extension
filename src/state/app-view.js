import { writable } from 'svelte/store'

export const appView = writable("HOMESCREEN")

export const handleAppView = ({ view }) => {
    if (view) {
        appView.update(state => {
            state = view 

            return state
        })
    }
}