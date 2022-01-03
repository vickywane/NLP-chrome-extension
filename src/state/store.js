import { writable } from 'svelte/store'
import { AGENT_URL } from '../utils/helpers'
import axios from 'axios'

const recorderBits = []

export const appState = writable({
    recorderInstance: null,
    searchQueryResult: null,
    textToSpeech: null
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

const submitRecording = async (formData) => {
    updateRecorderStatus({ status: "GENERATING_SEARCH_QUERY" })

    try {
        const req = await fetch(`http://localhost:4040/api/agent/voice-input`, {
            method: "POST",
            body: formData
        })

        // const { data } = await req.json()
        const { data } = await req.json()
        const { queryResult, webhookStatus } = data
        /**
         * Dialogflow return status codes. Non-0 inidicates execution failure
         */
        if (webhookStatus.code === 0) {
            appState.update((state) => {
                state.textToSpeech = queryResult.queryText
                state.searchQueryResult = queryResult.fulfillmentMessages[0].text.text[0]

                return state
            })

           return updateRecorderStatus({ status: "STOPPED", hasError: false })
        }  

        updateRecorderStatus({ status: "STOPPED", hasError: true })
        console.log(webhookStatus.message)
    } catch (e) {
        console.log("Error sending recording:", e);

        updateRecorderStatus({ status: "STOPPED", hasError: true })
    }
}

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
                    submitRecording(formData)
                }
            };
            return state
        })
    } catch (e) {
        console.log("STOP RECORD ERROR", e)
    }
};

