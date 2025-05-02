document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById("contactForm");
  
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
  
      const formData = {
        name: form.name.value,
        email: form.email.value,
        number: form.number.value,
        subject: form.subject.value,
        message: form.message.value
      };
  
      try {
        const res = await fetch("http://localhost:5000/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });
  
        const data = await res.json();
        alert(data.message || "Thank you! Your message has been sent.");
        form.reset();
      } catch (err) {
        console.error("Form submit error:", err);
        alert("Something went wrong. Please try again.");
      }
    });
  });
  