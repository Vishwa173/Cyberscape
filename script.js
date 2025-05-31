document.addEventListener("DOMContentLoaded", () => {
  const instructionBtn = document.getElementById("instructionBtn");
  const instructionPopup = document.getElementById("instructionPopup");
  const closePopup = document.getElementById("closePopup");

  instructionBtn.onclick = () => {
    instructionPopup.style.display = "flex";
  };

  closePopup.addEventListener("click", () => {
    instructionPopup.style.display = "none";
  });

  document.getElementById("normalModeBtn").addEventListener("click", () => {
    window.location.href = "scripts/general/normal.html";
  });
});