const SAVE_KEY = "kyaraez_sim_v1";

const gameState = {
  player: {
    name: "",
    style: "adventurer",
    seed: "kyara",
    money: 1250,
    needs: { energy: 100, hunger: 100, hygiene: 100, mood: 100 }
  },
  time: { hours: 7, minutes: 30, dayIndex: 0 },
  weather: "cerah",
  location: "home"
};

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

function avatarUrl(p) {
  const seed = encodeURIComponent(p.seed || p.name || "player");
  return `https://api.dicebear.com/7.x/${p.style || "adventurer"}/svg?seed=${seed}`;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.add("hidden"), 2000);
}

function speak(msg) {
  const el = document.getElementById("speech");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add("hidden"), 1600);
}

function clamp(n) { return Math.max(0, Math.min(100, n)); }

function updateNeeds(patch, msg) {
  const n = gameState.player.needs;
  Object.keys(patch).forEach(k => { n[k] = clamp(n[k] + patch[k]); });
  updateHUD();
  if (msg) {
    showToast(msg);
    speak(msg);
  }
}

function spend(price) {
  if (gameState.player.money < price) {
    showToast("Uang tidak cukup!");
    speak("Uangku kurang...");
    return false;
  }
  gameState.player.money -= price;
  return true;
}

function advanceTime(mins) {
  gameState.time.minutes += mins;
  while (gameState.time.minutes >= 60) {
    gameState.time.minutes -= 60;
    gameState.time.hours += 1;
  }
  if (gameState.time.hours >= 24) {
    gameState.time.hours = 0;
    gameState.time.dayIndex = (gameState.time.dayIndex + 1) % 7;
  }
}

function formatTime(h, m) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function updateHUD() {
  document.getElementById("game-time").textContent = formatTime(gameState.time.hours, gameState.time.minutes);
  document.getElementById("game-day").textContent = DAYS[gameState.time.dayIndex];
  document.getElementById("need-energy").textContent = Math.round(gameState.player.needs.energy);
  document.getElementById("need-hunger").textContent = Math.round(gameState.player.needs.hunger);
  document.getElementById("need-hygiene").textContent = Math.round(gameState.player.needs.hygiene);
  document.getElementById("need-mood").textContent = Math.round(gameState.player.needs.mood);
  document.getElementById("player-money").textContent = gameState.player.money.toLocaleString("id-ID");
}

function setLocation(loc) {
  gameState.location = loc;
  const stage = document.getElementById("stage");
  stage.className = "stage loc-" + loc;
  document.querySelectorAll(".map-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.loc === loc);
  });
  const names = { home: "Rumah", cafe: "Cafe", market: "Market", work: "Kerja" };
  document.getElementById("stage-hint").textContent = `Kamu di ${names[loc]}. Klik objek untuk aksi.`;
  saveGame(true);
}

function doAction(act) {
  switch (act) {
    case "sleep":
      updateNeeds({ energy: 40, mood: 10 }, "Zzz... segar!");
      advanceTime(60);
      break;
    case "bath":
      updateNeeds({ hygiene: 40, mood: 5 }, "Mandi selesai!");
      advanceTime(20);
      break;
    case "eat":
      updateNeeds({ hunger: 25 }, "Makan di rumah.");
      advanceTime(15);
      break;
    case "coffee":
      if (!spend(80)) return;
      updateNeeds({ mood: 15, energy: 5 }, "Kopi hangat~");
      advanceTime(10);
      break;
    case "cake":
      if (!spend(120)) return;
      updateNeeds({ hunger: 20, mood: 10 }, "Cake enak!");
      advanceTime(10);
      break;
    case "relax":
      updateNeeds({ mood: 12 }, "Santai di cafe.");
      advanceTime(15);
      break;
    case "snack":
      if (!spend(60)) return;
      updateNeeds({ hunger: 15 }, "Beli snack.");
      advanceTime(8);
      break;
    case "meal":
      if (!spend(150)) return;
      updateNeeds({ hunger: 35, mood: 5 }, "Beli makanan.");
      advanceTime(10);
      break;
    case "soap":
      if (!spend(90)) return;
      updateNeeds({ hygiene: 20 }, "Beli sabun.");
      advanceTime(8);
      break;
    case "work":
      if (gameState.player.needs.energy < 15) {
        showToast("Terlalu lelah!");
        speak("Capek...");
        return;
      }
      gameState.player.money += 200;
      updateNeeds({ energy: -15, mood: -8 }, "Kerja selesai +200");
      advanceTime(90);
      break;
  }
  updateHUD();
  saveGame(true);
}

function saveGame(silent) {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    player: gameState.player,
    time: gameState.time,
    weather: gameState.weather,
    location: gameState.location
  }));
  if (!silent) showToast("Disimpan 💾");
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    gameState.player = { ...gameState.player, ...data.player };
    gameState.time = { ...gameState.time, ...data.time };
    gameState.weather = data.weather || "cerah";
    gameState.location = data.location || "home";
    return true;
  } catch {
    return false;
  }
}

function updateAvatarPreview() {
  const p = gameState.player;
  document.getElementById("avatar-preview").src = avatarUrl(p);
  document.getElementById("preview-name").textContent = p.name || "Namamu";
}

function applyPlayer() {
  const p = gameState.player;
  document.getElementById("player-avatar").src = avatarUrl(p);
  document.getElementById("player-name").textContent = p.name || "Player";
}

let loop = null;
function startLoop() {
  if (loop) clearInterval(loop);
  loop = setInterval(() => {
    advanceTime(1);
    const n = gameState.player.needs;
    n.energy = clamp(n.energy - 0.12);
    n.hunger = clamp(n.hunger - 0.18);
    n.hygiene = clamp(n.hygiene - 0.08);
    n.mood = clamp(n.mood - 0.06);
    updateHUD();
  }, 1000);
}

function enterGame() {
  showScreen("game-world");
  applyPlayer();
  setLocation(gameState.location || "home");
  updateHUD();
  startLoop();
}

function setupCreator() {
  const nameInput = document.getElementById("input-name");
  const seedInput = document.getElementById("input-seed");
  seedInput.value = gameState.player.seed;

  nameInput.oninput = () => {
    gameState.player.name = nameInput.value.trim();
    if (!seedInput.value) gameState.player.seed = gameState.player.name || "kyara";
    updateAvatarPreview();
  };
  seedInput.oninput = () => {
    gameState.player.seed = seedInput.value.trim() || gameState.player.name || "kyara";
    updateAvatarPreview();
  };
  document.getElementById("btn-random-seed").onclick = () => {
    gameState.player.seed = Math.random().toString(36).slice(2, 8);
    seedInput.value = gameState.player.seed;
    updateAvatarPreview();
  };
  document.querySelectorAll("[data-style]").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll("[data-style]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      gameState.player.style = btn.dataset.style;
      updateAvatarPreview();
    };
  });
  document.getElementById("btn-finish-creator").onclick = () => {
    if (!gameState.player.name) return showToast("Isi nama dulu");
    if (!gameState.player.seed) gameState.player.seed = gameState.player.name;
    gameState.player.money = 1250;
    gameState.player.needs = { energy: 100, hunger: 100, hygiene: 100, mood: 100 };
    gameState.time = { hours: 7, minutes: 30, dayIndex: 0 };
    gameState.location = "home";
    saveGame(true);
    enterGame();
  };
  document.getElementById("btn-cancel-creator").onclick = () => showScreen("main-menu");
}

function setupGame() {
  document.getElementById("btn-new-game").onclick = () => {
    gameState.player.name = "";
    gameState.player.style = "adventurer";
    gameState.player.seed = "kyara";
    document.getElementById("input-name").value = "";
    document.getElementById("input-seed").value = "kyara";
    updateAvatarPreview();
    showScreen("character-creator");
  };
  document.getElementById("btn-continue").onclick = () => {
    if (!loadGame()) return showToast("Belum ada save");
    showToast("Dilanjutkan");
    enterGame();
  };
  document.getElementById("btn-multiplayer").onclick = () => showToast("Multiplayer belum ada");
  document.getElementById("btn-settings").onclick = () => showToast("Pengaturan belum ada");
  document.getElementById("btn-save").onclick = () => saveGame(false);
  document.getElementById("btn-menu").onclick = () => {
    if (confirm("Kembali ke menu?")) {
      saveGame(true);
      if (loop) clearInterval(loop);
      showScreen("main-menu");
    }
  };
  document.querySelectorAll(".map-btn").forEach(btn => {
    btn.onclick = () => setLocation(btn.dataset.loc);
  });
  document.querySelectorAll(".obj").forEach(btn => {
    btn.onclick = () => doAction(btn.dataset.act);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupCreator();
  setupGame();
  updateAvatarPreview();
  setTimeout(() => {
    document.getElementById("loading-screen").classList.add("hidden");
    showScreen("main-menu");
  }, 800);
});
