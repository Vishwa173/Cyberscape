document.getElementById("normalModeBtn").addEventListener("click", () => {
  window.location.href = "scripts/general/normal.html";
});

document.getElementById("instructionBtn").addEventListener("click", () => {
  document.getElementById("instructionPopup").style.display = "block";
});

document.getElementById("closePopup").addEventListener("click", () => {
  document.getElementById("instructionPopup").style.display = "none";
});
