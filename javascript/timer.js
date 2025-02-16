//Starts timer
function startTimer() {
    startTime = new Date().getTime();
  
    timerInterval = setInterval(function () {
      const now = new Date().getTime();
      const elapsed = now - startTime;
  
      const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (elapsed % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (elapsed % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
  
      const daysTens = Math.floor(days / 10);
      const daysOnes = days % 10;
      const hoursTens = Math.floor(hours / 10);
      const hoursOnes = hours % 10;
      const minutesTens = Math.floor(minutes / 10);
      const minutesOnes = minutes % 10;
      const secondsTens = Math.floor(seconds / 10);
      const secondsOnes = seconds % 10;
  
      document.getElementById("days-tens").innerText = daysTens;
      document.getElementById("days-ones").innerText = daysOnes;
      document.getElementById("hours-tens").innerText = hoursTens;
      document.getElementById("hours-ones").innerText = hoursOnes;
      document.getElementById("minutes-tens").innerText = minutesTens;
      document.getElementById("minutes-ones").innerText = minutesOnes;
      document.getElementById("seconds-tens").innerText = secondsTens;
      document.getElementById("seconds-ones").innerText = secondsOnes;
    }, 1000);
  }

//Resets timer when ovechkin scores
function resetTimer() {
    clearInterval(timerInterval);
    document.getElementById("days-tens").innerText = "0";
    document.getElementById("days-ones").innerText = "0";
    document.getElementById("hours-tens").innerText = "0";
    document.getElementById("hours-ones").innerText = "0";
    document.getElementById("minutes-tens").innerText = "0";
    document.getElementById("minutes-ones").innerText = "0";
    document.getElementById("seconds-tens").innerText = "0";
    document.getElementById("seconds-ones").innerText = "0";
  }