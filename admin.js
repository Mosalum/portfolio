// HARD-CODED CREDENTIALS
const ADMIN_USER = "admin";
const ADMIN_PASS = "mosal@2026";
const SESSION_KEY = "ms_admin_logged";

const loginCard = document.getElementById("loginCard");
const uploadCard = document.getElementById("uploadCard");

function checkLogin(){
  const ok = sessionStorage.getItem(SESSION_KEY) === "1";
  loginCard.style.display = ok ? "none" : "block";
  uploadCard.style.display = ok ? "block" : "none";
}

document.getElementById("loginBtn").addEventListener("click", () => {
  const u = document.getElementById("adminUser").value.trim();
  const p = document.getElementById("adminPass").value.trim();
  if(u === ADMIN_USER && p === ADMIN_PASS){
    sessionStorage.setItem(SESSION_KEY, "1");
    checkLogin();
  } else {
    alert("Invalid credentials");
  }
});

window.adminLogout = function(){
  sessionStorage.removeItem(SESSION_KEY);
  location.reload();
};

function uid(){
  return "w" + Math.random().toString(16).slice(2) + Date.now().toString(16);
}

document.getElementById("workForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const work = {
    id: uid(),
    title: document.getElementById("title").value.trim(),
    category: document.getElementById("category").value.trim(),
    thumb: document.getElementById("thumb").value.trim(),
    description: document.getElementById("desc").value.trim(),
    tags: document.getElementById("tags").value.trim()
      ? document.getElementById("tags").value.split(",").map(s => s.trim()).filter(Boolean)
      : [],
    link: document.getElementById("link").value.trim()
  };

  document.getElementById("jsonOut").value = JSON.stringify(work, null, 2);
});

checkLogin();
