import { writable } from 'svelte/store'

export const appView = writable("TEXTSCREEN")

export const handleAppView = ({ view }) => {
    if (view) {
        appView.update(state => {
            state = view 

            return state
        })
    }
}