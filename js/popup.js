// Login
document.addEventListener("DOMContentLoaded", (event) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTab = tabs[0];

    if (
      activeTab.url === "http://192.168.118.193/" ||
      activeTab.url === "http://192.168.118.193/dashboard"
    ) {
      chrome.tabs.sendMessage(
        activeTab.id,
        { action: "loginStatus" },
        function (response) {
          if (chrome.runtime.lastError) {
            const tht = $(".sidebar");
            for (let i = 0; i < tht.length; i++) {
              tht[i].style.display = "none";
            }
            localStorage.clear();
            console.error("Error sending message:", chrome.runtime.lastError);
            return;
          }
          if (response.status === "success") {
            const tht = $(".contain");
            for (let i = 0; i < tht.length; i++) {
              tht[i].style.display = "none";
            }
            localStorage.setItem("token", "user");
          }
          if (response.status === "failed") {
            const tht = $(".sidebar");
            for (let i = 0; i < tht.length; i++) {
              tht[i].style.display = "none";
            }
            localStorage.clear();
          }
        }
      );
    } else {
      const tokenData = localStorage.getItem("token");
      if (!tokenData) {
        const tht = $(".contain");
        for (let i = 0; i < tht.length; i++) {
          tht[i].style.display = "none";
        }
      } else {
        const tht = $(".contain");
        for (let i = 0; i < tht.length; i++) {
          tht[i].style.display = "none";
        }
      }
    }
  });

  //  Float Button 
  const floatingModeCheckbox = document.getElementById("floating-mode");
  const buttonDisplayState = localStorage.getItem("showCaptureButton");
  if (buttonDisplayState == "true") {
    floatingModeCheckbox.checked = JSON.parse(buttonDisplayState);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "floatButton", state: 1 });
    });
  }
  if (buttonDisplayState == "false") {
    floatingModeCheckbox.checked = JSON.parse(buttonDisplayState);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "floatButton", state: 0 });
    });
  }
  floatingModeCheckbox.addEventListener("change", function () {
    const isChecked = this.checked;
    localStorage.setItem("showCaptureButton", JSON.stringify(isChecked));

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "floatButton",
        state: isChecked,
      });
    });
  });
});

//////////////////////////////////////// Screenshot
document.getElementById("capture").addEventListener("click", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "startCapture" });
      chrome.tabs.update(tabs[0].id, { active: true }, function () {
        window.close();
      });
    } else {
      console.error("No active tabs found.");
    }
  });
});

