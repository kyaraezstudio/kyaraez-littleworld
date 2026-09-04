/**
 * KYARAEZ: Little World
 * Character Creator + Save/Load System
 */

const SAVE_KEY = "kyaraez_save";

const gameState = {
  currentScreen: "loading",
  player: {
    name: "",
    type: "child",
    gender: "female",
    skinColor: "#fce2c4",
    hairColor: "#2c1a0e",
    hairStyle: "short",
    clothesColor: "#ff8fab",
    money: 1250,
    needs: {
      energy: 100,
      hunger: 100,
      hygiene: 100,
      mood: 100
    }
  },
  time: {
    hours: 7,
    minutes: 30,
    dayIndex: 0
  },
  weather: "cerah"
};

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

// ======================
// Screen
// ======================

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(el => el.classList.add("hidden"));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.remove("hidden");
    gameState.currentScreen = screenId;
  }
}

// ======================
// Toast
// ======================

function showToast(message, duration = 2200) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, duration);
}

// ======================
// Save / Load
// ======================

function saveGame() {
  try {
    const data = {
      player: gameState.player,
      time: gameState.time,
      weather: gameState.weather,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    showToast("Game berhasil disimpan! 💾");
    return true;
  } catch (e) {
    showToast("Gagal menyimpan game");
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

// ======================
// Character Creator
// ======================

function updateCharacterPreview() {
  const p = gameState.player;
  const face = document.getElementById("preview-face");
  const hair = document.getElementById("preview-hair");
  const body = document.getElementById("preview-body");
  const nameEl = document.getElementById("preview-name");

  if (face) face.style.background = p.skinColor;
  if (hair) {
    hair.style.background = p.hairColor;
    if (p.hairStyle === "long") {
      hair.style.height = "70px";
      hair.style.borderRadius = "50% 50% 30% 30%";
    } else if (p.hairStyle === "curly") {
      hair.style.height = "55px";
      hair.style.borderRadius = "40%";
    } else if (p.hairStyle === "ponytail") {
      hair.style.height = "45px";
      hair.style.borderRadius = "50% 50% 10% 10%";
    } else {
      hair.style.height = "50px";
      hair.style.borderRadius = "50% 50% 20% 20%";
    }
  }
  if (body) body.style.background = p.clothesColor;
  if (nameEl) nameEl.textContent = p.name || "Namamu";
}

function setupCharacterCreator() {
  document.getElementById("input-name").addEventListener("input", (e) => {
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

// ======================
// Game World
// ======================

function enterGameWorld() {
  showScreen("game-world");
  applyCharacterToWorld();
  updateHUD();
  startGameLoop();

  const name = gameState.player.name || "Player";
  document.getElementById("world-greeting").textContent =
    `Halo, ${name}! Selamat datang di Little World ☀️`;
}

function applyCharacterToWorld() {
  const p = gameState.player;
  const char = document.getElementById("world-character");
  if (!char) return;

  const face = char.querySelector(".char-face");
  const hair = char.querySelector(".char-hair");
  const body = char.querySelector(".char-body");

  if (face) face.style.background = p.skinColor;
  if (hair) hair.style.background = p.hairColor;
  if (body) body.style.background = p.clothesColor;
}

// ======================
// Time System
// ======================

let gameLoopInterval = null;

function startGameLoop() {
  if (gameLoopInterval) clearInterval(gameLoopInterval);
  gameLoopInterval = setInterval(() => {
    advanceTime(1);
    updateHUD();
  }, 1000);
}

function advanceTime(minutes) {
  gameState.time.minutes += minutes;
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
  document.getElementById("game-time").textContent = formatTime(
    gameState.time.hours,
    gameState.time.minutes
  );
  document.getElementById("game-day").textContent = DAYS[gameState.time.dayIndex];

  const weatherMap = {
    cerah: { icon: "☀️", text: "Cerah" },
    berawan: { icon: "⛅", text: "Berawan" },
    hujan: { icon: "🌧️", text: "Hujan" },
    "hujan-lebat": { icon: "⛈️", text: "Hujan Lebat" },
    mendung: { icon: "☁️", text: "Mendung" }
  };
  const w = weatherMap[gameState.weather] || weatherMap.cerah;
  document.getElementById("weather-icon").textContent = w.icon;
  document.getElementById("weather-text").textContent = w.text;

  const n = gameState.player.needs;
  document.getElementById("need-energy").textContent = n.energy;
  document.getElementById("need-hunger").textContent = n.hunger;
  document.getElementById("need-hygiene").textContent = n.hygiene;
  document.getElementById("need-mood").textContent = n.mood;
  document.getElementById("player-money").textContent =
    gameState.player.money.toLocaleString("id-ID");
}

// ======================
// Menu
// ======================

function setupMenuButtons() {
  document.getElementById("btn-new-game").addEventListener("click", () => {
    gameState.player.name = "";
    gameState.player.type = "child";
    gameState.player.gender = "female";
    gameState.player.skinColor = "#fce2c4";
    gameState.player.hairColor = "#2c1a0e";
    gameState.player.hairStyle = "short";
    gameState.player.clothesColor = "#ff8fab";

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

  document.getElementById("btn-save").addEventListener("click", () => {
    saveGame();
  });

  document.getElementById("btn-menu").addEventListener("click", () => {
    if (confirm("Kembali ke Main Menu?\n(Progress otomatis disimpan)")) {
      saveGame();
      if (gameLoopInterval) clearInterval(gameLoopInterval);
      showScreen("main-menu");
    }
  });
}

// ======================
// Init
// ======================

function startLoading() {
  setTimeout(() => {
    document.getElementById("loading-screen").classList.add("hidden");
    showScreen("main-menu");
  }, 1200);
}

document.addEventListener("DOMContentLoaded", () => {
  setupMenuButtons();
  setupCharacterCreator();
  updateCharacterPreview();
  startLoading();
});
