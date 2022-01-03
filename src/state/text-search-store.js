import { writable } from "svelte/store";
import { AGENT_URL } from '../utils/helpers'

export const textSearchState = writable("SOKMETHING")
export const searchStatus = writable({
    status: "",
    hasError: false
})

const updateSearchStatus = ({ status, hasError }) => {
    searchStatus.update(state => {
        state.hasError = hasError ? hasError : state.hasError
        state.status = status ? status : state.status

        return state
    })
}

export const submitSearchSentence = async sentence => {
    updateSearchStatus({ status: "GENERATING_SEARCH_RESULT" })

    try {
        const req = await fetch(`${AGENT_URL}`, {
            body: { message: sentence }
        })

        const { data } = await req.json()
        console.log(data);
    } catch (e) {
        updateSearchStatus({ hasError: true })
    }

}

