const SAVE_KEY = "kyaraez_save";

const gameState = {
  currentScreen: "loading",
  player: {
    name: "",
    type: "child",
    gender: "female",
    skinColor: "#fce2c4",
    hairColor: "#3b2a1a",
    hairStyle: "short",
    clothesColor: "#5d8a4e",
    money: 1250,
    needs: { energy: 100, hunger: 100, hygiene: 100, mood: 100 }
  },
  time: { hours: 7, minutes: 30, dayIndex: 0 },
  weather: "cerah"
};

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(el => el.classList.add("hidden"));
  const t = document.getElementById(id);
  if (t) {
    t.classList.remove("hidden");
    gameState.currentScreen = id;
  }
}

function showToast(msg, dur = 2200) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.add("hidden"), dur);
}

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      player: gameState.player,
      time: gameState.time,
      weather: gameState.weather,
      savedAt: new Date().toISOString()
    }));
    showToast("Game berhasil disimpan! 💾");
    return true;
  } catch (e) {
    showToast("Gagal menyimpan");
    return false;
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data.player || !data.time) return false;
    gameState.player = { ...gameState.player, ...data.player };
    gameState.time = { ...gameState.time, ...data.time };
    gameState.weather = data.weather || "cerah";
    return true;
  } catch (e) {
    return false;
  }
}

function hasSaveData() {
  return !!localStorage.getItem(SAVE_KEY);
}

function applyChibi(prefix, p) {
  const head = document.getElementById(prefix + "-head") || document.getElementById(prefix === "p" ? "p-head" : "w-head");
  const hair = document.getElementById(prefix + "-hair") || document.getElementById(prefix === "p" ? "p-hair" : "w-hair");
  const body = document.getElementById(prefix + "-body") || document.getElementById(prefix === "p" ? "p-body" : "w-body");

  if (head) head.style.background = p.skinColor;
  if (body) body.style.background = p.clothesColor;
  if (hair) {
    hair.style.background = p.hairColor;
    if (p.hairStyle === "long") {
      hair.style.height = "68px";
      hair.style.borderRadius = "50% 50% 25% 25%";
    } else if (p.hairStyle === "curly") {
      hair.style.height = "52px";
      hair.style.borderRadius = "45%";
    } else if (p.hairStyle === "ponytail") {
      hair.style.height = "44px";
      hair.style.borderRadius = "50% 50% 12% 12%";
    } else {
      hair.style.height = "48px";
      hair.style.borderRadius = "50% 50% 20% 20%";
    }
  }
}

function updateCharacterPreview() {
  const p = gameState.player;
  applyChibi("p", p);
  const nameEl = document.getElementById("preview-name");
  if (nameEl) nameEl.textContent = p.name || "Namamu";
}

function setupCharacterCreator() {
  document.getElementById("input-name").addEventListener("input", e => {
    gameState.player.name = e.target.value.trim();
    updateCharacterPreview();
  });

  document.querySelectorAll("[data-type]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-type]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      gameState.player.type = btn.dataset.type;
    });
  });

  document.querySelectorAll("[data-gender]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-gender]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      gameState.player.gender = btn.dataset.gender;
    });
  });

  document.querySelectorAll("#skin-colors .color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#skin-colors .color-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      gameState.player.skinColor = btn.dataset.color;
      updateCharacterPreview();
    });
  });

  document.querySelectorAll("#hair-colors .color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#hair-colors .color-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      gameState.player.hairColor = btn.dataset.color;
      updateCharacterPreview();
    });
  });

  document.querySelectorAll("[data-hair]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-hair]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      gameState.player.hairStyle = btn.dataset.hair;
      updateCharacterPreview();
    });
  });

  document.querySelectorAll("#clothes-colors .color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#clothes-colors .color-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      gameState.player.clothesColor = btn.dataset.color;
      updateCharacterPreview();
    });
  });

  document.getElementById("btn-finish-creator").addEventListener("click", () => {
    if (!gameState.player.name) {
      showToast("Isi nama karakter dulu ya!");
      document.getElementById("input-name").focus();
      return;
    }
    gameState.player.needs = { energy: 100, hunger: 100, hygiene: 100, mood: 100 };
    gameState.player.money = 1250;
    gameState.time = { hours: 7, minutes: 30, dayIndex: 0 };
    gameState.weather = "cerah";
    saveGame();
    enterGameWorld();
  });

  document.getElementById("btn-cancel-creator").addEventListener("click", () => {
    showScreen("main-menu");
  });
}

function enterGameWorld() {
  showScreen("game-world");
  applyChibi("w", gameState.player);
  updateHUD();
  startGameLoop();
  const name = gameState.player.name || "Player";
  document.getElementById("world-greeting").textContent = `Kamar Tidur • ${name}`;
}

let gameLoopInterval = null;

function startGameLoop() {
  if (gameLoopInterval) clearInterval(gameLoopInterval);
  gameLoopInterval = setInterval(() => {
    advanceTime(1);
    updateHUD();
  }, 1000);
}

function advanceTime(min) {
  gameState.time.minutes += min;
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

  const map = {
    cerah: { icon: "☀️", text: "Cerah" },
    berawan: { icon: "⛅", text: "Berawan" },
    hujan: { icon: "🌧️", text: "Hujan" },
    "hujan-lebat": { icon: "⛈️", text: "Hujan Lebat" },
    mendung: { icon: "☁️", text: "Mendung" }
  };
  const w = map[gameState.weather] || map.cerah;
  document.getElementById("weather-icon").textContent = w.icon;
  document.getElementById("weather-text").textContent = w.text;

  const n = gameState.player.needs;
  document.getElementById("need-energy").textContent = n.energy;
  document.getElementById("need-hunger").textContent = n.hunger;
  document.getElementById("need-hygiene").textContent = n.hygiene;
  document.getElementById("need-mood").textContent = n.mood;
  document.getElementById("player-money").textContent = gameState.player.money.toLocaleString("id-ID");
}

function setupMenuButtons() {
  document.getElementById("btn-new-game").addEventListener("click", () => {
    gameState.player.name = "";
    gameState.player.type = "child";
    gameState.player.gender = "female";
    gameState.player.skinColor = "#fce2c4";
    gameState.player.hairColor = "#3b2a1a";
    gameState.player.hairStyle = "short";
    gameState.player.clothesColor = "#5d8a4e";

    document.getElementById("input-name").value = "";
    document.querySelectorAll("[data-type]").forEach(b => b.classList.remove("active"));
    document.querySelector('[data-type="child"]').classList.add("active");
    document.querySelectorAll("[data-gender]").forEach(b => b.classList.remove("active"));
    document.querySelector('[data-gender="female"]').classList.add("active");

    updateCharacterPreview();
    showScreen("character-creator");
  });

  document.getElementById("btn-continue").addEventListener("click", () => {
    if (!hasSaveData()) {
      showToast("Belum ada data tersimpan");
      return;
    }
    if (loadGame()) {
      showToast("Game berhasil dilanjutkan!");
      enterGameWorld();
    } else {
      showToast("Data save rusak");
    }
  });

  document.getElementById("btn-multiplayer").addEventListener("click", () => {
    showToast("Multiplayer masih dalam pengembangan");
  });

  document.getElementById("btn-settings").addEventListener("click", () => {
    showToast("Pengaturan masih dalam pengembangan");
  });

  document.getElementById("btn-save").addEventListener("click", () => saveGame());

  document.getElementById("btn-menu").addEventListener("click", () => {
    if (confirm("Kembali ke Main Menu?\n(Progress otomatis disimpan)")) {
      saveGame();
      if (gameLoopInterval) clearInterval(gameLoopInterval);
      showScreen("main-menu");
    }
  });
}

function startLoading() {
  setTimeout(() => {
    document.getElementById("loading-screen").classList.add("hidden");
    showScreen("main-menu");
  }, 1100);
}

document.addEventListener("DOMContentLoaded", () => {
  setupMenuButtons();
  setupCharacterCreator();
  updateCharacterPreview();
  startLoading();
});
