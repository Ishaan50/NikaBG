<script>
  // Enable or disable maintenance mode here:
  const maintenanceMode = true; // set to false when site is live

  if (maintenanceMode) {
    // Hide all existing content
    document.body.innerHTML = `
      <div style="
        display:flex;
        flex-direction:column;
        justify-content:center;
        align-items:center;
        height:100vh;
        background-color:#0d0d0d;
        color:white;
        font-family:Arial, sans-serif;
        text-align:center;
      ">
        <h1 style="font-size:2rem;">We'll be back soon!</h1>
        <p style="opacity:0.8;">Our site is currently under maintenance.<br>Please check again later.</p>
      </div>
    `;
  }
</script>
