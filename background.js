const
  baseUrl = 'https://jira.westernacher.com',
  keyPrefix = 'NSWDEV';

function resetDefaultSuggestion() {
    chrome.omnibox.setDefaultSuggestion({
        description: `open JIRA ticket: ${keyPrefix}-%s`
    });
}

resetDefaultSuggestion();

chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
    fetch(`${baseUrl}/rest/api/2/search?jql=key=${keyPrefix}-${text}`, {
        credentials: 'include'
    })
    .then(res => res.json())
    .then(result => {
        if (result && result.issues && result.issues.length > 0) {
          const issue = result.issues[0];
          chrome.omnibox.setDefaultSuggestion(
              {description: `<match>${issue.fields.summary}</match> - <url>${baseUrl}/browse/${keyPrefix}-${text}</url>`}
          );
        }
        else {
            resetDefaultSuggestion();
        }
    })
    .catch(error => {
        console.error(error);
        resetDefaultSuggestion();
    });
});

chrome.omnibox.onInputCancelled.addListener(() => resetDefaultSuggestion());


function navigate(url) {
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
        chrome.tabs.update(tabs[0].id, {url: url});
    });
}

chrome.omnibox.onInputEntered.addListener(ticketNumber => navigate(`${baseUrl}/browse/${keyPrefix}-${ticketNumber}`));
