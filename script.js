  // Maintenance Countdown (45 hours)
  (function maintenanceCountdown(){
    const countdownEl = document.getElementById("countdown");
    if (!countdownEl) return;

    // 45 hours from now
    const endTime = Date.now() + (45 * 60 * 60 * 1000);

    function updateCountdown(){
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0){
        countdownEl.textContent = "⏳ 0h 0m 0s";
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      countdownEl.textContent = `⏳ ${hours}h ${minutes}m ${seconds}s`;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  })();
