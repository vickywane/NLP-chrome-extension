chrome.runtime.onInstalled.addListener((details) => {
    // if (details.reason.search(/install/g) === -1) {
    //     console.log("HERE BITCH")
    //     return
    // }

    chrome.tabs.create({
        url: chrome.runtime.getURL("welcome.html"),
        active: true
    })
})