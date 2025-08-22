//buypuzzle.js
// buypuzzle.js
import { API_BASE_URL } from './env.js';
const stripe = Stripe("pk_test_51ORJoiG2bkDewjdvKJWhEyxMATYufDM7vXvwV5DYBGSdt3VkkBqqR0inymD8l1V15mhpAToQ4N6oR59YzJFlgTA00Ulo4V4WL");

// Link checkboxes to buttons with behavior
function setupOption(checkboxId, buttonId, productId, allOptions) {
  const checkbox = document.getElementById(checkboxId);
  const button = document.getElementById(buttonId);

  // Disable button initially
  button.disabled = true;

  // Toggle button (alert removed, only one active at a time)
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      // Uncheck and disable all other checkboxes/buttons
      allOptions.forEach(({ checkbox: otherBox, button: otherButton }) => {
        if (otherBox !== checkbox) {
          otherBox.checked = false;
          otherButton.disabled = true;
        }
      });

      // Enable this button
      button.disabled = false;
    } else {
      button.disabled = true;
    }
  });

  // On button click, redirect to Stripe Checkout
  button.addEventListener("click", () => {
    if (!checkbox.checked) {
      alert("Please agree to terms & conditions first.");
      return;
    }

    handleStripeCheckout(productId);
  });
}

// Main purchase handler (calls your backend)
function handleStripeCheckout(product) {
  fetch(`${API_BASE_URL}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product }) // send product type like "pdf"
  })
  .then(async res => {
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Server error ${res.status}: ${errorText}`);
    }
    return res.json();
  })
  .then(data => {
    if (data.id) {
      stripe.redirectToCheckout({ sessionId: data.id });
    } else {
      throw new Error("No session ID returned.");
    }
  })
  .catch(err => {
    console.error("Checkout error:", err);
    alert("Error starting payment. See console.");
  });
}

// Call setupOption after page loads
document.addEventListener("DOMContentLoaded", () => {
  const options = [
    { checkbox: document.getElementById("checkClueMark"), button: document.getElementById("stripeCheckoutClue"), productId: "clue" },
    { checkbox: document.getElementById("checkPDFMark"), button: document.getElementById("stripeCheckoutPDF"), productId: "pdf" },
    { checkbox: document.getElementById("checkWebNoMark"), button: document.getElementById("stripeCheckoutNoMark"), productId: "nomark_web" },
    { checkbox: document.getElementById("checkWeb"), button: document.getElementById("stripeCheckoutSelfMark"), productId: "selfmark_web" },
    { checkbox: document.getElementById("checkNuclear"), button: document.getElementById("stripeCheckoutNuclear"), productId: "nuclear" }
  ];

  options.forEach(opt => setupOption(opt.checkbox.id, opt.button.id, opt.productId, options));
});
