
//TODO: Trigger this Ops at btn click
navigator.mediaDevices.getUserMedia({ audio: true }).then((mediaStream) => {
    setTimeout(() => {
        mediaStream.getTracks().forEach(track => track.enabled && track.stop())
    }, 100)
}).catch(e => {
    console.log(e);
})
