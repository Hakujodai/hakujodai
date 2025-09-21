// ===== Setup Handling =====
const goalInput = document.getElementById("goalInput");
const workInput = document.getElementById("workInput");
const breakInput = document.getElementById("breakInput");
const setupBtn = document.getElementById("setupBtn");
const goalDisplay = document.getElementById("goalDisplay");

const setupContainer = document.getElementById("setupContainer");
const timerContainer = document.getElementById("timerContainer");
const quitBtn = document.getElementById("quitBtn");

// Grab the main heading
const mainHeading = document.querySelector("h1");

quitBtn.addEventListener("click", () => {
  // Stop timer if running
  clearInterval(timer);

  // Reset states
  isRunning = false;
  waitingForNext = false;
  isWorkSession = true;

  // Reset heading back to default
  mainHeading.textContent = "ポモドーロ";

  // Hide timer, show setup again
  timerContainer.style.display = "none";
  setupContainer.style.display = "block";

  // Reset timer display
  document.getElementById("timerDisplay").textContent = "00:00";
});

let workDuration = 25 * 60;
let breakDuration = 5 * 60;
let timeLeft = workDuration;
let timer;
let isRunning = false;
let isWorkSession = true;
let waitingForNext = false;

function updateDisplay() {
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  document.getElementById("timerDisplay").textContent =
    `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function applySetup() {
  const goalText = goalInput.value.trim();
  const workVal = parseInt(workInput.value, 10);
  const breakVal = parseInt(breakInput.value, 10);

  if (isNaN(workVal) || workVal <= 0 || isNaN(breakVal) || breakVal <= 0) {
    alert("Sorry, but the numbers you entered are not valid :(\nPlease enter whole numbers greater than 0!");
    return;
  }

  // Save values
  workDuration = workVal * 60;
  breakDuration = breakVal * 60;
  timeLeft = workDuration;
  updateDisplay();

  // Swap heading with goal text (fallback to ポモドーロ if empty)
  mainHeading.textContent = goalText !== "" ? goalText : "ポモドーロ";

  // Switch UI
  setupContainer.style.display = "none";
  timerContainer.style.display = "block";
}

setupBtn.addEventListener("click", applySetup);

// ===== Timer Handling =====
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

async function notifyUser(message) {
  if (window.electronAPI && window.electronAPI.sendNotification) {
    await window.electronAPI.sendNotification(message);
    console.log("🔔 Notification sent & acknowledged:", message);
  } else {
    console.log("⚠️ Notification API not available. Using alert fallback.");
    alert(message);
  }
}

function startTimer() {
  if (!isRunning && !waitingForNext) {
    isRunning = true;
    timer = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        clearInterval(timer);
        isRunning = false;
        waitingForNext = true;

        // Switch session type
        isWorkSession = !isWorkSession;
        timeLeft = isWorkSession ? workDuration : breakDuration;
        updateDisplay();

        // Notify
        if (isWorkSession) {
          notifyUser("Break time's over, back to work!");
        } else {
          notifyUser("Time for a break!");
        }
      }
    }, 1000);
  } else if (waitingForNext) {
    waitingForNext = false;
    startTimer();
  }
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  timeLeft = isWorkSession ? workDuration : breakDuration;
  updateDisplay();
}

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

updateDisplay(); // initialize
const setInput = document.getElementById("setInput");
const setDisplay = document.getElementById("setDisplay");

let totalSets = 1;
let setsLeft = 1;

function applySetup() {
  const goalText = goalInput.value.trim();
  const workVal = parseInt(workInput.value, 10);
  const breakVal = parseInt(breakInput.value, 10);
  const setVal = parseInt(setInput.value, 10);

  if (
    isNaN(workVal) || workVal <= 0 ||
    isNaN(breakVal) || breakVal <= 0 ||
    isNaN(setVal) || setVal <= 0
  ) {
    alert("Sorry, but the numbers you entered are not valid :(\nPlease enter whole numbers greater than 0!");
    return;
  }

  // Save values
  workDuration = workVal * 60;
  breakDuration = breakVal * 60;
  totalSets = setVal;
  setsLeft = totalSets;

  timeLeft = workDuration;
  updateDisplay();
  updateSetDisplay();

  // Swap heading with goal text (fallback to ポモドーロ if empty)
  mainHeading.textContent = goalText !== "" ? goalText : "ポモドーロ";

  // Switch UI
  setupContainer.style.display = "none";
  timerContainer.style.display = "block";
}

function updateSetDisplay() {
  setDisplay.textContent = setsLeft > 0 ? `${setsLeft} セット残り!` : "All sets completed 🎉";
}

function startTimer() {
  if (!isRunning && !waitingForNext) {
    isRunning = true;
    timer = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        clearInterval(timer);
        isRunning = false;
        waitingForNext = true;

        // Switch session type
        isWorkSession = !isWorkSession;

        if (isWorkSession) {
          // Finished one full cycle (work+break)
          setsLeft--;
          updateSetDisplay();

          if (setsLeft <= 0) {
            notifyUser("All sets done! Great job :D");
            return; // stop here, don’t continue
          }
        }

        timeLeft = isWorkSession ? workDuration : breakDuration;
        updateDisplay();

        // Notify
        if (isWorkSession) {
          notifyUser("Break time's over, back to work!");
        } else {
          notifyUser("Time for a break!");
        }
      }
    }, 1000);
  } else if (waitingForNext) {
    waitingForNext = false;
    startTimer();
  }
}
