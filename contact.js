const enquiryForm = document.getElementById("enquiry-form");
if (enquiryForm) {
  const status = document.getElementById("form-status");
  enquiryForm.addEventListener("submit", event => {
    event.preventDefault();
    if (!enquiryForm.reportValidity()) return;
    const values = new FormData(enquiryForm);
    const message = [
      "Hello Mohamed, I found Mosalum Digital online.",
      `Name: ${values.get("name")}`,
      `Reply contact: ${values.get("reply")}`,
      `Service: ${values.get("service")}`,
      `Project: ${values.get("message")}`
    ].join("\n");
    const target = `https://wa.me/255678635302?text=${encodeURIComponent(message)}`;
    window.location.assign(target);
    status.textContent = "WhatsApp is opening with your message ready for you to review and send.";
  });
  const initialService = new URLSearchParams(window.location.search).get("service");
  const serviceSelect = enquiryForm.elements.namedItem("service");
  if (initialService && serviceSelect) {
    const option = [...serviceSelect.options].find(item => item.text.toLowerCase() === initialService.toLowerCase());
    if (option) serviceSelect.value = option.value;
  }
}
