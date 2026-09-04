const SAVE_KEY = "kyaraez_save_v2";

const gameState = {
  player: {
    name: "",
    type: "child",
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

const LOCATIONS = {
  home: {
    title: "Rumah",
    desc: "Tempat istirahat dan merawat diri.",
    actions: [
      { id: "sleep", label: "Tidur", info: "+40 Energi, +10 Mood", fn: doSleep },
      { id: "eat_home", label: "Makan di rumah", info: "+25 Lapar (gratis)", fn: () => changeNeed("hunger", 25, "Kamu makan bekal di rumah.") },
      { id: "bath", label: "Mandi", info: "+40 Kebersihan, +5 Mood", fn: doBath }
    ]
  },
  cafe: {
    title: "Cafe",
    desc: "Tempat nongkrong biar mood naik.",
    actions: [
      { id: "coffee", label: "Beli Kopi (80)", info: "+15 Mood, +5 Energi", fn: () => buyItem(80, () => { changeNeed("mood", 15); changeNeed("energy", 5); }, "Kopi hangat, mood naik.") },
      { id: "cake", label: "Beli Cake (120)", info: "+20 Lapar, +10 Mood", fn: () => buyItem(120, () => { changeNeed("hunger", 20); changeNeed("mood", 10); }, "Cake-nya enak!") },
      { id: "chat", label: "Duduk santai", info: "+12 Mood", fn: () => changeNeed("mood", 12, "Kamu duduk santai di cafe.") }
    ]
  },
  market: {
    title: "Supermarket",
    desc: "Belanja kebutuhan harian.",
    actions: [
      { id: "snack", label: "Beli Snack (60)", info: "+15 Lapar", fn: () => buyItem(60, () => changeNeed("hunger", 15), "Snack berhasil dibeli.") },
      { id: "meal", label: "Beli Makanan (150)", info: "+35 Lapar, +5 Mood", fn: () => buyItem(150, () => { changeNeed("hunger", 35); changeNeed("mood", 5); }, "Makanan siap saji dibeli.") },
      { id: "soap", label: "Beli Sabun (90)", info: "+20 Kebersihan", fn: () => buyItem(90, () => changeNeed("hygiene", 20), "Sabun dibeli.") }
    ]
  },
  work: {
    title: "Tempat Kerja",
    desc: "Kerja sebentar untuk dapat uang.",
    actions: [
      { id: "work1", label: "Kerja Shift Pendek", info: "+200 uang, -15 Energi, -8 Mood", fn: doWork }
    ]
  }
};

function avatarUrl(p) {
  const style = p.style || "adventurer";
  const seed = encodeURIComponent(p.seed || p.name || "player");
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
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
  t._timer = setTimeout(() => t.classList.add("hidden"), 2200);
}

function clamp(n) {
  return Math.max(0, Math.min(100, n));
}

function changeNeed(key, amount, msg) {
  gameState.player.needs[key] = clamp(gameState.player.needs[key] + amount);
  updateHUD();
  if (msg) showToast(msg);
}

function buyItem(price, effect, msg) {
  if (gameState.player.money < price) {
    showToast("Uang tidak cukup!");
    return;
  }
  gameState.player.money -= price;
  effect();
  updateHUD();
  showToast(msg);
}

function doSleep() {
  changeNeed("energy", 40);
  changeNeed("mood", 10);
  advanceTime(60);
  showToast("Kamu tidur sebentar. Segar!");
  updateHUD();
}

function doBath() {
  changeNeed("hygiene", 40);
  changeNeed("mood", 5);
  advanceTime(20);
  showToast("Mandi selesai. Segar!");
  updateHUD();
}

function doWork() {
  if (gameState.player.needs.energy < 15) {
    showToast("Terlalu lelah untuk bekerja!");
    return;
  }
  gameState.player.money += 200;
  changeNeed("energy", -15);
  changeNeed("mood", -8);
  advanceTime(90);
  showToast("Kerja selesai! +200");
  updateHUD();
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify({
    player: gameState.player,
    time: gameState.time,
    weather: gameState.weather,
    location: gameState.location
  }));
  showToast("Progress disimpan 💾");
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
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
  const url = avatarUrl(p);
  document.getElementById("avatar-preview").src = url;
  document.getElementById("preview-name").textContent = p.name || "Namamu";
}

function applyPlayerAvatar() {
  const p = gameState.player;
  document.getElementById("player-avatar").src = avatarUrl(p);
  document.getElementById("player-label").textContent = p.name || "Player";
}

function renderLocation() {
  const loc = LOCATIONS[gameState.location];
  document.getElementById("location-title").textContent = loc.title;
  document.getElementById("location-desc").textContent = loc.desc;

  document.querySelectorAll(".loc-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.loc === gameState.location);
  });

  const list = document.getElementById("action-list");
  list.innerHTML = "";
  loc.actions.forEach(a => {
    const btn = document.createElement("button");
    btn.className = "action-btn";
    btn.innerHTML = `${a.label}<small>${a.info}</small>`;
    btn.onclick = () => {
      a.fn();
      saveGame();
    };
    list.appendChild(btn);
  });
}

function formatTime(h, m) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
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

function updateHUD() {
  document.getElementById("game-time").textContent = formatTime(gameState.time.hours, gameState.time.minutes);
  document.getElementById("game-day").textContent = DAYS[gameState.time.dayIndex];
  document.getElementById("need-energy").textContent = Math.round(gameState.player.needs.energy);
  document.getElementById("need-hunger").textContent = Math.round(gameState.player.needs.hunger);
  document.getElementById("need-hygiene").textContent = Math.round(gameState.player.needs.hygiene);
  document.getElementById("need-mood").textContent = Math.round(gameState.player.needs.mood);
  document.getElementById("player-money").textContent = gameState.player.money.toLocaleString("id-ID");
}

let loop = null;
function startLoop() {
  if (loop) clearInterval(loop);
  loop = setInterval(() => {
    advanceTime(1);
    // needs turun pelan
    gameState.player.needs.energy = clamp(gameState.player.needs.energy - 0.15);
    gameState.player.needs.hunger = clamp(gameState.player.needs.hunger - 0.22);
    gameState.player.needs.hygiene = clamp(gameState.player.needs.hygiene - 0.1);
    gameState.player.needs.mood = clamp(gameState.player.needs.mood - 0.08);
    updateHUD();
  }, 1000);
}

function enterGame() {
  showScreen("game-world");
  applyPlayerAvatar();
  renderLocation();
  updateHUD();
  startLoop();
}

function setupCreator() {
  const nameInput = document.getElementById("input-name");
  const seedInput = document.getElementById("input-seed");

  nameInput.addEventListener("input", () => {
    gameState.player.name = nameInput.value.trim();
    if (!seedInput.value) gameState.player.seed = gameState.player.name || "kyara";
    updateAvatarPreview();
  });

  seedInput.addEventListener("input", () => {
    gameState.player.seed = seedInput.value.trim() || gameState.player.name || "kyara";
    updateAvatarPreview();
  });

  document.getElementById("btn-random-seed").onclick = () => {
    gameState.player.seed = Math.random().toString(36).slice(2, 8);
    seedInput.value = gameState.player.seed;
    updateAvatarPreview();
  };

  document.querySelectorAll("[data-type]").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll("[data-type]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      gameState.player.type = btn.dataset.type;
    };
  });

  document.querySelectorAll("[data-style]").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll("[data-style]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      gameState.player.style = btn.dataset.style;
      updateAvatarPreview();
    };
  });

  document.getElementById("btn-finish-creator").onclick = () => {
    if (!gameState.player.name) {
      showToast("Isi nama dulu!");
      return;
    }
    if (!gameState.player.seed) gameState.player.seed = gameState.player.name;
    gameState.player.money = 1250;
    gameState.player.needs = { energy: 100, hunger: 100, hygiene: 100, mood: 100 };
    gameState.time = { hours: 7, minutes: 30, dayIndex: 0 };
    gameState.location = "home";
    saveGame();
    enterGame();
  };

  document.getElementById("btn-cancel-creator").onclick = () => showScreen("main-menu");
}

function setupMenu() {
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
    if (!localStorage.getItem(SAVE_KEY)) {
      showToast("Belum ada save");
      return;
    }
    if (loadGame()) {
      showToast("Game dilanjutkan");
      enterGame();
    } else showToast("Save rusak");
  };

  document.getElementById("btn-multiplayer").onclick = () => showToast("Multiplayer belum tersedia");
  document.getElementById("btn-settings").onclick = () => showToast("Pengaturan belum tersedia");
  document.getElementById("btn-save").onclick = saveGame;
  document.getElementById("btn-menu").onclick = () => {
    if (confirm("Kembali ke menu? Progress disimpan.")) {
      saveGame();
      if (loop) clearInterval(loop);
      showScreen("main-menu");
    }
  };

  document.querySelectorAll(".loc-btn").forEach(btn => {
    btn.onclick = () => {
      gameState.location = btn.dataset.loc;
      renderLocation();
      saveGame();
    };
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupMenu();
  setupCreator();
  updateAvatarPreview();
  setTimeout(() => {
    document.getElementById("loading-screen").classList.add("hidden");
    showScreen("main-menu");
  }, 900);
});
