//buypuzzle.js
//const stripe = Stripe("pk_test_51ORJoiG2bkDewjdvKJWhEyxMATYufDM7vXvwV5DYBGSdt3VkkBqqR0inymD8l1V15mhpATpOQ4N6oR59YzJFlgTA00Ulo4V4WL");

let allCheckboxes = [];
let allButtons = [];

// Link checkboxes to buttons with behavior
function setupOption(checkboxId, buttonId, productId) {
  const checkbox = document.getElementById(checkboxId);
  const button = document.getElementById(buttonId);

  if (!checkbox || !button) {
    console.warn(`Element not found: checkbox='${checkboxId}', button='${buttonId}'`);
    return; // Stop setup if elements are missing
  }

  allCheckboxes.push(checkbox);
  allButtons.push(button);

  // Disable button initially
  button.disabled = true;

  // Toggle button, make sure only ONE is enabled at a time
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      allCheckboxes.forEach(cb => {
        if (cb !== checkbox) cb.checked = false;
      });
      allButtons.forEach(btn => {
        if (btn !== button) btn.disabled = true;
      });
      button.disabled = false;
    } else {
      button.disabled = true;
    }
  });

  // Button click triggers Stripe checkout
  button.addEventListener("click", () => {
    if (!checkbox.checked) {
      alert("Please agree to terms & conditions first.");
      return;
    }
    handleStripeCheckout(productId);
  });
}



// Initialize all options safely after window load
document.addEventListener("load", () => {
  const options = [
    ["checkClueMark", "stripeCheckoutClue", "clue"],
    ["checkPDFMark", "stripeCheckoutPDF", "pdf"],
    ["checkWebNoMark", "stripeCheckoutNoMark", "nomark_web"],
    ["checkWeb", "stripeCheckoutSelfMark", "selfmark_web"],
    ["checkNuclear", "stripeCheckoutNuclear", "nuclear"]
  ];

  options.forEach(([checkboxId, buttonId, productId]) => setupOption(checkboxId, buttonId, productId));
});
