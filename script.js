document.addEventListener("DOMContentLoaded", () => {
  let punkte = 0;
  let punkteProKlick = 1;
  let adminAktiv = false;

  const sounds = {
    click: new Audio("sounds/click.wav"),
    upgrade: new Audio("sounds/upgrade.wav"),
    error: new Audio("sounds/error.wav")
  };

  const klickUpgrades = [
    { id: "buyClick1", name: "Tap Tap Boost", bonus: 1, base: 50, factor: 1.6, level: 0 },
    { id: "buyClick2", name: "Double Trouble", bonus: 5, base: 300, factor: 1.75, level: 0 },
    { id: "buyClick3", name: "Thicc Click", bonus: 15, base: 1500, factor: 1.9, level: 0 },
    { id: "buyClick4", name: "Click Tornado", bonus: 40, base: 8000, factor: 2.0, level: 0 },
    { id: "buyClick5", name: "Finger of Doom", bonus: 100, base: 40000, factor: 2.2, level: 0 }
  ];

  const autoClickerStufen = [0, 0, 0, 0, 0];
  const autoClickerStartKosten = [1000, 4000, 15000, 60000, 250000];
  const autoClickerFaktor = 1.6;
  const autoClickerPower = [1, 5, 15, 50, 200];
  const autoClickerNamen = [
    "Clickdrone Mini",
    "AutoTap Pro",
    "Fingerbot 3000",
    "Klick-Fabrik",
    "Klick-Galaxie"
  ];

  const score = document.getElementById("score");
  const nachricht = document.getElementById("nachricht");
  const proKlickAnzeige = document.getElementById("proKlick");
  const clickButton = document.getElementById("clicker");

  

  clickButton.addEventListener("click", () => {
    sounds.click.play();
    punkte += punkteProKlick;
    updateUI();
    showFloatingPoints(punkteProKlick);
    saveGame();
  });

  klickUpgrades.forEach((upg) => {
    const btn = document.getElementById(upg.id);
    btn.addEventListener("click", () => {
      const preis = getKlickPreis(upg);
      if (punkte >= preis) {
        punkte -= preis;
        punkteProKlick += upg.bonus;
        upg.level++;
        sounds.upgrade.play();
        updateUI();
        saveGame();
      } else {
        sounds.error.play();
        showMessage("Nicht genug Punkte für " + upg.name + " (" + preis + ")");
      }
    });
  });

  for (let i = 0; i < 5; i++) {
    const btn = document.getElementById("buyAuto" + (i + 1));
    btn.addEventListener("click", () => {
      const kosten = getAutoKosten(i);
      if (punkte >= kosten) {
        punkte -= kosten;
        autoClickerStufen[i]++;
        updateUI();
        saveGame();
      } else {
        showMessage("Nicht genug Punkte für " + autoClickerNamen[i] + " (" + kosten + ")");
      }
    });
  }

  setInterval(() => {
    for (let i = 0; i < autoClickerStufen.length; i++) {
      punkte += autoClickerStufen[i] * autoClickerPower[i];
    }
    updateUI();
    saveGame();
  }, 1000);

  document.getElementById("toggleShop").addEventListener("click", () => {
    document.getElementById("shopPanel").classList.toggle("active");
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Fortschritt wirklich löschen?")) {
      punkte = 0;
      punkteProKlick = 1;
      klickUpgrades.forEach(upg => upg.level = 0);
      for (let i = 0; i < autoClickerStufen.length; i++) {
        autoClickerStufen[i] = 0;
      }
      localStorage.removeItem("clickhero_save");
      updateUI();
      showMessage("Spielstand wurde zurückgesetzt!");
    }
  });

 

 
  function getKlickPreis(upg) {
    return Math.floor(upg.base * Math.pow(upg.factor, upg.level));
  }

  function getAutoKosten(i) {
    return Math.floor(autoClickerStartKosten[i] * Math.pow(autoClickerFaktor, autoClickerStufen[i]));
  }

  function updateUI() {
    score.textContent = "Punkte: " + punkte;
    proKlickAnzeige.textContent = "Punkte pro Klick: " + punkteProKlick;

    klickUpgrades.forEach((upg) => {
      document.getElementById(upg.id).textContent =
        `${upg.name} (+${upg.bonus}) (Stufe ${upg.level}) – ${getKlickPreis(upg)} Punkte`;
    });

    for (let i = 0; i < 5; i++) {
      document.getElementById("buyAuto" + (i + 1)).textContent =
        `${autoClickerNamen[i]} (Stufe ${autoClickerStufen[i]}) – ${getAutoKosten(i)} Punkte`;
    }
  }

  function showFloatingPoints(amount) {
    const container = document.getElementById("click-effects");
    if (!container) return;

    const float = document.createElement("div");
    float.className = "floating-text";

    const emojis = ["🍭", "✨", "💥", "🎉"];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    const fontSize = Math.min(16 + amount * 0.4, 48);
    float.style.fontSize = fontSize + "px";
    float.textContent = `+${amount} ${emoji}`;

    container.appendChild(float);
    setTimeout(() => container.removeChild(float), 1000);
  }

  function showMessage(text) {
    nachricht.textContent = text;
    setTimeout(() => (nachricht.textContent = ""), 2000);
  }

  function saveGame() {
    const data = {
      punkte,
      punkteProKlick,
      klickUpgrades: klickUpgrades.map(upg => upg.level),
      autoClickerStufen
    };
    localStorage.setItem("clickhero_save", JSON.stringify(data));
  }

  function loadGame() {
    const data = localStorage.getItem("clickhero_save");
    if (data) {
      const save = JSON.parse(data);
      punkte = save.punkte ?? 0;
      punkteProKlick = save.punkteProKlick ?? 1;
      klickUpgrades.forEach((upg, i) => upg.level = save.klickUpgrades?.[i] ?? 0);
      save.autoClickerStufen?.forEach((val, i) => autoClickerStufen[i] = val ?? 0);
    }
  }

  // SOUND TOGGLE
let soundMuted = false;
document.getElementById("toggleSound").addEventListener("click", () => {
  soundMuted = !soundMuted;
  Object.values(sounds).forEach(s => s.muted = soundMuted);
  document.getElementById("toggleSound").textContent = soundMuted ? "🔇 Sound: Aus" : "🔈 Sound: An";
});

// SETTINGS PANEL TOGGLE
document.getElementById("toggleSettings").addEventListener("click", () => {
  document.getElementById("settingsPanel").classList.toggle("active");
});

// CHEATCODE EINGABE
document.getElementById("cheatButton").addEventListener("click", () => {
  const code = prompt("Cheatcode eingeben:");
  if (!code) return;

  if (code === "cash5000") {
    punkte += 5000;
    showMessage("💸 5000 Punkte erhalten!");
  } else if (code === "allupgrades") {
    klickUpgrades.forEach(upg => {
      upg.level += 3;
      punkteProKlick += upg.bonus * 3;
    });
    showMessage("📈 Alle Upgrades +3");
  } else {
    showMessage("❌ Unbekannter Cheatcode");
  }

  updateUI();
  saveGame();
});
});
