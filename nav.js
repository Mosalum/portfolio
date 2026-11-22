const menuButton = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("site-nav");

document.querySelectorAll("#year").forEach(element => {
  element.textContent = new Date().getFullYear();
});

if (menuButton && siteNav) {
  const setExpanded = expanded => {
    menuButton.setAttribute("aria-expanded", String(expanded));
    menuButton.setAttribute("aria-label", expanded ? "Close navigation" : "Open navigation");
    siteNav.classList.toggle("is-open", expanded);
  };
  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") !== "true";
    setExpanded(expanded);
  });
  siteNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setExpanded(false)));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
      setExpanded(false);
      menuButton.focus();
    }
  });
}
