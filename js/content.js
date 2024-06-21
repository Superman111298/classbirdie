const API_URL = "https://earthledger.global/BBB/BBB/public/api/capture";

window.addEventListener("storage", function (event) {
  chrome.runtime.sendMessage({ action: "getTabUrl" }, (response) => {
    if (response && response.url) {
      console.log("Current tab URL:", response.url);
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "floatButton") {
    if (message.state) {
      createCaptureButton();
    } else {
      removeCaptureButton();
    }
  }

  if (message.action === "loginStatus") {
    const token = localStorage.getItem("token");
    if (token) {
      sendResponse({ status: "success" });
    } else if (!token) {
      sendResponse({ status: "success" });
    }
  }

  if (message.action === "startCapture") {
    const hideDiv = $(".classbirdie-answerDiv");
    if (hideDiv.length != 0) {
      hideDiv.hide();
    }
    startCapture();
  }
});

function startCapture() {
  var flag = 1;
  let startX, startY, endX, endY;
  let isSelecting = false;
  let selectionDiv;

  const initialdiv = document.createElement("div");
  initialdiv.className = "capture-initialDiv";
  initialdiv.style.position = "fixed";
  initialdiv.style.top = "0px";
  initialdiv.style.left = "0px";
  initialdiv.style.cursor = "crosshair";
  initialdiv.style.width = "100%";
  initialdiv.style.height = "100%";
  initialdiv.style.zIndex = "10001";
  initialdiv.style.backgroundColor = "rgba(0, 0, 0, 0)";
  initialdiv.style.display = "block";
  document.body.appendChild(initialdiv);

  function createSelectionDiv() {
    const selectionDiv = document.createElement("div");
    selectionDiv.style.position = "fixed";
    selectionDiv.style.border = "2px dashed #ff0066";
    selectionDiv.style.borderRadius = "10px";
    selectionDiv.style.backgroundColor = "rgba(255, 0, 255, 0.1)";
    selectionDiv.style.zIndex = "10005";
    document.body.appendChild(selectionDiv);
    return selectionDiv;
  }

  document.addEventListener("mousedown", (event) => {
    if (flag === 1) {
      isSelecting = true;
      startX = event.clientX;
      startY = event.clientY;
      selectionDiv = createSelectionDiv();
      selectionDiv.style.left = `${startX}px`;
      selectionDiv.style.top = `${startY}px`;
    }
    return;
  });

  document.addEventListener("mousemove", (event) => {
    if (!isSelecting) return;
    endX = event.clientX;
    endY = event.clientY;
    selectionDiv.style.width = `${Math.abs(endX - startX)}px`;
    selectionDiv.style.height = `${Math.abs(endY - startY)}px`;
    selectionDiv.style.left = `${Math.min(startX, endX)}px`;
    selectionDiv.style.top = `${Math.min(startY, endY)}px`;
  });

  document.addEventListener("mouseup", (event) => {
    if (!isSelecting) return;
    isSelecting = false;
    selectionDiv.remove();

    // DevicePixelRatio because the MacOS or the other OS and DEVICES
    const dpr = window.devicePixelRatio;
    let ostartX = Math.min(startX, endX) * dpr;
    let ostartY = Math.min(startY, endY) * dpr;
    let width = Math.abs(endX - startX) * dpr;
    let height = Math.abs(endY - startY) * dpr;

    // Send a message to the background script to capture the visible tab
    if (width >= 10 && height >= 10) {
      chrome.runtime.sendMessage({
        action: "captureVisibleArea",
        startX: ostartX,
        startY: ostartY,
        width: width,
        height: height,
      });
    } else {
      startCapture();
    }
    initialdiv.style.display = "none";
    flag = 0;
  });
}

// float button 
const captureButton = document.createElement("button");
function createCaptureButton() {
  captureButton.textContent = "Class" + "\n" + "Birdie";
  captureButton.style.position = "fixed";
  captureButton.style.bottom = "50px";
  captureButton.style.right = "30px";
  captureButton.style.zIndex = "99999";
  captureButton.style.padding = "10px";
  captureButton.style.backgroundColor = "rgb(52, 25, 211)";
  captureButton.style.color = "white";
  captureButton.style.border = "none";
  captureButton.style.width = "70px";
  captureButton.style.height = "70px";
  captureButton.style.borderRadius = "35px";
  captureButton.style.cursor = "pointer";
  captureButton.style.fontSize = "16px";
  document.body.appendChild(captureButton);
}
function removeCaptureButton() {
  captureButton.remove();
}

captureButton.addEventListener("click", () => {
  const hideDiv = $(".classbirdie-answerDiv");
  if (hideDiv.length != 0) {
    hideDiv.hide();
  }
  startCapture();
});

// Listen for the captured image and process it
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "processCapturedImage") {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = message.width;
      canvas.height = message.height;

      context.drawImage(
        img,
        message.startX,
        message.startY,
        message.width,
        message.height,
        0,
        0,
        message.width,
        message.height
      );

      const croppedImageDataUrl = canvas.toDataURL();

      $.ajax({
        url: `${API_URL}`,
        type: "POST",
        data: { image: croppedImageDataUrl }, // Ensure data is JSON stringified
        success: function (data) {
          showResult(data);
        },
        error: function (xhr, status, error) {},
      });

      const answerDiv = document.createElement("div");
      answerDiv.className = "classbirdie-answerDiv";

      const thinkingImg = document.createElement("img");
      thinkingImg.src = "https://ai-humanwriter.com/public/thinking.svg";
      thinkingImg.className = "classbirdie-thinkingImg";

      const thinkingDiv = document.createElement("div");
      thinkingDiv.className = "classbirdie-thinkingDiv";
      thinkingDiv.append(thinkingImg);

      const answerTitle = document.createElement("h2");
      answerTitle.innerHTML = "ClassBirdie";

      const answerBtnClose = document.createElement("button");
      answerBtnClose.className = "classbirdie-answerDiv-close";
      answerBtnClose.addEventListener("click", answerDivClose);
      answerBtnClose.innerHTML = "&times;";

      const answerHr = document.createElement("hr");
      answerHr.className = "classbirdie-answerHr";

      const answerSubTitle = document.createElement("h3");
      answerSubTitle.innerHTML = "Correct Answer";

      const correctAnswerDiv = document.createElement("div");
      correctAnswerDiv.className = "classbirdie-correctAnswerDiv";

      const accBtn = document.createElement("button");
      accBtn.className = "classbirdie-accBtn";
      accBtn.innerHTML = "Explanation";
      accBtn.addEventListener("click", explaintoggle);

      const explainDiv = document.createElement("div");
      explainDiv.className = "classbirdie-explainDiv";

      const answerBtn = document.createElement("button");
      answerBtn.className = "classbirdie-answerDiv-capture";
      answerBtn.addEventListener("click", answerBtnCapture);
      answerBtn.innerHTML = "Take Screenshot";

      answerDiv.append(
        answerTitle,
        answerBtnClose,
        answerHr,
        thinkingDiv,
        answerBtn
      );

      function explaintoggle() {
        var panel = this.nextElementSibling;
        if (panel.style.display === "block") {
          panel.style.display = "none";
        } else {
          panel.style.display = "block";
        }
      }

      document.body.appendChild(answerDiv);

      function showResult(data) {
        if (data === "#no#") {
          answerDiv.removeChild(thinkingDiv);
          correctAnswerDiv.innerHTML =
            "Oops, It seems have no questions and answers or any letters. Please take a screenshot of the question and answer choices and try again, so I can assist you.";
          answerDiv.append(
            answerTitle,
            answerBtnClose,
            answerHr,
            answerSubTitle,
            correctAnswerDiv,
            answerBtn
          );
        } else {
          const regex = /\*\*\*([^*]+)\*\*\*/;
          const match = data.match(regex);
          if (match && match[1]) {
            let coAnswer = match[1].trim();
            correctAnswerDiv.innerHTML = coAnswer;
          } else {
            correctAnswerDiv.innerHTML = "Unknown Question";
          }

          const startIndex = data.indexOf("<<<");
          const endIndex = data.indexOf(">>>");
          // Extract the substring between "<<<" and ">>>"
          if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
            let extractedString = data.substring(startIndex + 3, endIndex);
            explainDiv.innerHTML = extractedString;
          } else {
            explainDiv.innerHTML = "Unknown Explain";
          }
          answerDiv.removeChild(thinkingDiv);
          answerDiv.append(
            answerTitle,
            answerBtnClose,
            answerHr,
            answerSubTitle,
            correctAnswerDiv,
            accBtn,
            explainDiv,
            answerBtn
          );
          document.body.appendChild(answerDiv);
        }
      }

      function answerBtnCapture() {
        answerDiv.style.display = "none";
        startCapture();
      }

      function answerDivClose() {
        answerDiv.style.display = "none";
      }

      // AnswerDiv Draggable start
      let isDragging = false;
      let offsetX = 0;
      let offsetY = 0;

      answerTitle.addEventListener("mousedown", function (e) {
        isDragging = true;
        offsetX = e.clientX - answerDiv.offsetLeft;
        offsetY = e.clientY - answerDiv.offsetTop;
        document.body.style.userSelect = "none"; // Disable text selection
      });

      document.addEventListener("mousemove", function (e) {
        if (isDragging) {
          answerDiv.style.left = `${e.clientX - offsetX}px`;
          answerDiv.style.top = `${e.clientY - offsetY}px`;
        }
      });

      document.addEventListener("mouseup", function () {
        isDragging = false;
        document.body.style.userSelect = ""; // Enable text selection
      });
      // AnswerDiv Draggable end
    };
    img.src = message.dataUrl;
  }
});
