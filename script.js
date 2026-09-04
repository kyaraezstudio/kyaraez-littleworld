/**
 * KYARAEZ: Little World
 * Main Game Script (Base)
 */

// ======================
// State
// ======================

const gameState = {
  currentScreen: "loading",
  player: {
    name: "",
    type: null, // "child" | "adult"
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
    day: "Senin"
  },
  weather: "cerah" // cerah | berawan | hujan | hujan-lebat | mendung
};

// ======================
// Screen Management
// ======================

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(el => {
    el.classList.add("hidden");
  });

  const target = document.getElementById(screenId);
  if (target) {
    target.classList.remove("hidden");
    gameState.currentScreen = screenId;
  }
}

// ======================
// Loading
// ======================

function startLoading() {
  setTimeout(() => {
    document.getElementById("loading-screen").classList.add("hidden");
    showScreen("main-menu");
  }, 1500);
}

// ======================
// Main Menu Buttons
// ======================

function setupMenuButtons() {
  document.getElementById("btn-new-game").addEventListener("click", () => {
    showScreen("character-creator");
  });

  document.getElementById("btn-continue").addEventListener("click", () => {
    alert("Fitur Lanjutkan masih dalam pengembangan");
  });

  document.getElementById("btn-multiplayer").addEventListener("click", () => {
    alert("Multiplayer Room masih dalam pengembangan.\nNanti bisa buat / join room pakai kode.");
  });

  document.getElementById("btn-settings").addEventListener("click", () => {
    alert("Pengaturan masih dalam pengembangan");
  });

  document.getElementById("btn-finish-creator").addEventListener("click", () => {
    showScreen("game-world");
    startGameLoop();
  });
}

// ======================
// Game Loop (Time)
// ======================

let gameLoopInterval = null;

function startGameLoop() {
  updateHUD();

  if (gameLoopInterval) clearInterval(gameLoopInterval);

  gameLoopInterval = setInterval(() => {
    advanceTime(1);
    updateHUD();
  }, 1000);
}

function advanceTime(minutes) {
  gameState.time.minutes += minutes;

  if (gameState.time.minutes >= 60) {
    gameState.time.minutes = 0;
    gameState.time.hours += 1;
  }

  if (gameState.time.hours >= 24) {
    gameState.time.hours = 0;
  }
}

function formatTime(hours, minutes) {
  const h = String(hours).padStart(2, "0");
  const m = String(minutes).padStart(2, "0");
  return `${h}:${m}`;
}

function updateHUD() {
  document.getElementById("game-time").textContent = formatTime(
    gameState.time.hours,
    gameState.time.minutes
  );
  document.getElementById("game-day").textContent = gameState.time.day;

  const weatherMap = {
    cerah: { icon: "☀️", text: "Cerah" },
    berawan: { icon: "⛅", text: "Berawan" },
    hujan: { icon: "🌧️", text: "Hujan" },
    "hujan-lebat": { icon: "⛈️", text: "Hujan Lebat" },
    mendung: { icon: "☁️", text: "Mendung" }
  };

  const weather = weatherMap[gameState.weather] || weatherMap.cerah;
  document.getElementById("weather-icon").textContent = weather.icon;
  document.getElementById("weather-text").textContent = weather.text;

  document.getElementById("need-energy").textContent = gameState.player.needs.energy;
  document.getElementById("need-hunger").textContent = gameState.player.needs.hunger;
  document.getElementById("need-hygiene").textContent = gameState.player.needs.hygiene;
  document.getElementById("need-mood").textContent = gameState.player.needs.mood;

  document.getElementById("player-money").textContent = gameState.player.money.toLocaleString("id-ID");
}

// ======================
// Init
// ======================

document.addEventListener("DOMContentLoaded", () => {
  setupMenuButtons();
  startLoading();
});
