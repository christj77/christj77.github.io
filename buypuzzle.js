//buypuzzle.js

// Link checkboxes to buttons with behavior
function setupOption(checkboxId, buttonId ) {
  const checkbox = document.getElementById(checkboxId);
  const button = document.getElementById(buttonId);

  // Disable button initially
  button.disabled = true;

  // Show agreement alert and toggle button
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
alert("1 Crossword = 1 User = 1 Device\nI Agree To Purchase Terms & Conditionz");

      button.disabled = false;
    } else {
      button.disabled = true;
    }
  });

  // On button click, redirect to Stripe Checkout

}

// Call setupOption after page loads
document.addEventListener("DOMContentLoaded", () => {
  setupOption("checkClueMark", "stripeCheckoutClue", "clue");
  setupOption("checkPDFMark", "stripeCheckoutPDF", "pdf");
  setupOption("checkWebNoMark", "stripeCheckoutNoMark", "nomark_web");
  setupOption("checkWeb", "stripeCheckoutSelfMark", "selfmark_web");
  setupOption("checkNuclear", "stripeCheckoutNuclear", "nuclear");
});

