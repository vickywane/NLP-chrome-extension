import { writable } from 'svelte/store'
import { AGENT_URL } from '../utils/helpers'

const recorderBits = []

export const appState = writable({
    recorderStatus: 'STOPPED',
    recorderInstance: null,
    searchQueryResult: null
})

export const recorderStatus = writable({ status: "STOPPED", hasError: false })

const updateRecorderStatus = ({ status, hasError }) => {
    recorderStatus.update(state => {
        state.status = status ? status : state.hasError
        state.hasError = hasError ? hasError : state.hasError

        return state
    })
}

export const startRecorder = async () => {
    try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })

        appState.update(state => {
            const recorderInstance = new MediaRecorder(mediaStream)
            state.recorderInstance = recorderInstance

            state.recorderInstance.start()
            state.recorderInstance.ondataavailable = (event) => {
                recorderBits.push(event.data)
            }

            return state
        })

        updateRecorderStatus({ status: "RECORDING" })
    } catch (e) {
        console.log("RECORD ERROR", e)
    }
};

export const stopRecorder = async () => {
    try {
        const formData = new FormData();

        appState.update(state => {
            state.recorderInstance.stop()

            state.recorderInstance.onstop = async () => {
                if (state.recorderInstance.state === "inactive") {
                    const recordBlob = new Blob(recorderBits, {
                        type: "audio/mp3",
                    });

                    const inputFile = new File([recordBlob], "input", {
                        type: "audio/ogg; codecs=opus",
                    });

                    formData.append("voiceInput", inputFile);
                }
            };

            return state
        })

        updateRecorderStatus({ status: "GENERATING_SEARCH_QUERY" })

        appState.update(async (state) => {
            try {
                const req = await fetch(`${AGENT_URL}/voice-input`, {
                    method: "POST",
                    body: formData
                })

                const response = await req.json()
                state.searchQueryResult = { result: response }
                updateRecorderStatus({ status: "STOPPED", hasError: false })

                return state
            } catch (e) {
                console.log("Error sending recording:", e);

                updateRecorderStatus({ status: "STOPPED", hasError: true })
            }
        })

    } catch (e) {
        console.log("STOP RECORD ERROR", e)
    }
};