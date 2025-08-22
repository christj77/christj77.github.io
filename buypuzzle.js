//buypuzzle.js
import { API_BASE_URL } from './env.js';
const stripe = Stripe("pk_test_51ORJoiG2bkDewjdvKJWhEyxMATYufDM7vXvwV5DYBGSdt3VkkBqqR0inymD8l1V15mhpATpOQ4N6oR59YzJFlgTA00Ulo4V4WL");

let allCheckboxes = [];
let allButtons = [];

// Link checkboxes to buttons with behavior
function setupOption(checkboxId, buttonId, productId) {
  const checkbox = document.getElementById(checkboxId);
  const button = document.getElementById(buttonId);

  allCheckboxes.push(checkbox);
  allButtons.push(button);

  // Disable button initially
  button.disabled = true;

  // Toggle button, and make sure only ONE is enabled at a time
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      // Uncheck all other checkboxes and disable their buttons
      allCheckboxes.forEach(cb => {
        if (cb !== checkbox) cb.checked = false;
      });
      allButtons.forEach(btn => {
        if (btn !== button) btn.disabled = true;
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
  setupOption("checkClueMark", "stripeCheckoutClue", "clue");
  setupOption("checkPDFMark", "stripeCheckoutPDF", "pdf");
  setupOption("checkWebNoMark", "stripeCheckoutNoMark", "nomark_web");
  setupOption("checkWeb", "stripeCheckoutSelfMark", "selfmark_web");
  setupOption("checkNuclear", "stripeCheckoutNuclear", "nuclear");
});
