// Load Stripe public key
const stripe = Stripe("");

// Link checkboxes to buttons with behavior
function setupOption(checkboxId, buttonId, productId) {
  const checkbox = document.getElementById(checkboxId);
  const button = document.getElementById(buttonId);

  // Disable button initially
  button.disabled = true;

  // Show agreement alert and toggle button
  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      alert("I agree to purchase policy terms");
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
  fetch("/create-checkout-session", {
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
