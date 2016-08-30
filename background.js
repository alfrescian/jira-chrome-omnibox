function resetDefaultSuggestion() {
    chrome.omnibox.setDefaultSuggestion({
        description: 'open JIRA ticket: NSWDEV-%s'
    });
}

resetDefaultSuggestion();

chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
    fetch('https://jira.westernacher.com/rest/api/2/search?jql=key=NSWDEV-' + text, {
        credentials: 'include'
    })
    .then(function (res) {
        return res.json()
    })
    .then(function (result) {
        if (result && result.issues && result.issues.length > 0) {
          const issue = result.issues[0];
          chrome.omnibox.setDefaultSuggestion(
              {description: `<match>${issue.fields.summary}</match> - <url>https://jira.westernacher.com/browse/NSWDEV-${text}</url>`}
          );
        }
        else {
            resetDefaultSuggestion();
        }
    })
    .catch(function (error) {
        console.error(error);
        resetDefaultSuggestion();
    });
});

chrome.omnibox.onInputCancelled.addListener(function () {
    resetDefaultSuggestion();
});


function navigate(url) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.update(tabs[0].id, {url: url});
    });
}

chrome.omnibox.onInputEntered.addListener(function (ticketNumber) {
    navigate("https://jira.westernacher.com/browse/NSWDEV-" + ticketNumber);
});
