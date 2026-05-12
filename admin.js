function uid(){
  return "w" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function setupAdminMenu(){
  const menuToggle = document.getElementById("menuToggle");
  const siteNav = document.getElementById("siteNav");
  const themeToggle = document.getElementById("themeToggle");
  const themeKey = "ms_theme";

  if(themeToggle){
    const applyTheme = (theme) => {
      const isLight = theme === "light";
      document.body.classList.toggle("light-theme", isLight);
      themeToggle.textContent = isLight ? "☀️" : "🌙";
      themeToggle.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
    };

    const savedTheme = localStorage.getItem(themeKey) || "dark";
    applyTheme(savedTheme);
    themeToggle.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("light-theme") ? "dark" : "light";
      localStorage.setItem(themeKey, nextTheme);
      applyTheme(nextTheme);
    });
  }

  if(!menuToggle || !siteNav) return;
  const resetMenu = () => {
    siteNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open menu");
    menuToggle.textContent = "☰";
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    menuToggle.textContent = isOpen ? "✕" : "☰";
  });

  siteNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      if(window.innerWidth > 640) return;
      resetMenu();
    });
  });

  window.addEventListener("resize", () => {
    if(window.innerWidth > 640) resetMenu();
  });
}

const workForm = document.getElementById("workForm");

if(workForm){
  workForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const work = {
      id: uid(),
      title: document.getElementById("title").value.trim(),
      category: document.getElementById("category").value.trim(),
      thumb: document.getElementById("thumb").value.trim(),
      description: document.getElementById("desc").value.trim(),
      tags: document.getElementById("tags").value.trim()
        ? document.getElementById("tags").value.split(",").map(value => value.trim()).filter(Boolean)
        : [],
      link: document.getElementById("link").value.trim()
    };

    document.getElementById("jsonOut").value = JSON.stringify(work, null, 2);
  });
}

setupAdminMenu();
