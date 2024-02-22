async function start() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const views = chrome.extension.getViews({ type: 'popup' });
  let attendance = 'Yes';
  if (views.length > 0) {
    attendance = views[0].document.getElementById('attendance-status').value;
  }
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    args: [attendance],
    function: (params) => {
      // start by clicking the button matching the attendance status: Yes, Maybe, or No
      // this selector narrows down the buttons to ~12, then it finds the text content that matches the attendance status
      Array.from(document.querySelectorAll("td div div[role='button']"))
        .find((el) => el.textContent === params)
        .click();

      // mutation observer to watch for DOM changes
      var observer = new MutationObserver(() => {
        // clear the timeout if it exists
        if (window.timerId) {
          clearTimeout(window.timerId);
        }
        // set a new timeout to wait 150ms for mutations to stop
        window.timerId = setTimeout(function () {
          // find the button that matches the attendance status
          let attendanceButton = Array.from(
            document.querySelectorAll("td div div[role='button']")
          ).find((el) => el.textContent === params);

          if (attendanceButton) {
            // if the button exists, click it and go to the next email
            document.querySelectorAll("[aria-label='Older']")[1].click();
            attendanceButton.click();
            // attendanceButton = null;
          } else {
            // if the button doesn't exist, stop the observer
            observer.disconnect();
          }
        }, 150);
      });
      observer.observe(document, { childList: true, subtree: true });
    },
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('start').addEventListener('click', start);
});
