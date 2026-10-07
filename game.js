const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const healthBar = document.getElementById("healthBar");
const healthText = document.getElementById("healthText");
const enemyName = document.getElementById("enemyName");
const enemyCounter = document.getElementById("enemyCounter");
const message = document.getElementById("gameMessage");

const fullscreenBtn = document.getElementById("fullscreenBtn");
const restartButton = document.getElementById("restartButton");
const attackButton = document.getElementById("attackButton");
const meteorButton = document.getElementById("meteorButton");

const keys = {};

let mouse = {
  x: 600,
  y: 270
};

let selectedElement = "fire";

let projectiles = [];
let particles = [];

let gameOver = false;
let victory = false;

let currentEnemy = 0;
let meteorUnlocked = false;

let lastTime = 0;

const elements = {

  fire: {
    name: "Fogo",
    color: "#ff6335",
    damage: 20,
    speed: 8
  },

  water: {
    name: "Água",
    color: "#45a8ff",
    damage: 16,
    speed: 9
  },

  air: {
    name: "Ar",
    color: "#d9eee0",
    damage: 13,
    speed: 11
  },

  earth: {
    name: "Terra",
    color: "#91c456",
    damage: 28,
    speed: 5
  }

};

const enemyTypes = [

  {
    name: "Goblin da Mata",
    hp: 80,
    speed: 0.75,
    size: 20,
    color: "#7d9e43"
  },

  {
    name: "Guardião das Sombras",
    hp: 130,
    speed: 0.9,
    size: 25,
    color: "#7653a4"
  },

  {
    name: "Dragão da Floresta",
    hp: 200,
    speed: 0.65,
    size: 32,
    color: "#bd4c3c"
  }

];

const player = {
  x: 150,
  y: HEIGHT / 2,
  hp: 100,
  maxHp: 100,
  speed: 3
};

let enemy;

/* =========================
   INICIALIZAÇÃO
========================= */

function startGame() {

  player.x = 150;
  player.y = HEIGHT / 2;
  player.hp = 100;

  currentEnemy = 0;
  gameOver = false;
  victory = false;

  meteorUnlocked = false;

  projectiles = [];
  particles = [];

  meteorButton.disabled = true;

  createEnemy();

  updateHUD();
}


/* =========================
   CRIA INIMIGO
========================= */

function createEnemy() {

  const data = enemyTypes[currentEnemy];

  enemy = {

    x: WIDTH - 170,
    y: 100 + Math.random() * 330,

    hp: data.hp,
    maxHp: data.hp,

    speed: data.speed,
    size: data.size,
    color: data.color,

    hitTimer: 0

  };

  enemyName.textContent = data.name;

  enemyCounter.textContent =
    `INIMIGO ${currentEnemy + 1} / ${enemyTypes.length}`;

  message.textContent =
    currentEnemy === 0
      ? "O primeiro inimigo apareceu!"
      : "⚔️ Um novo inimigo apareceu!";

}


/* =========================
   ELEMENTOS
========================= */

function selectElement(element) {

  if (!elements[element]) return;

  selectedElement = element;

  document
    .querySelectorAll(".power[data-element]")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.element === element
      );

    });

}


/* =========================
   ATAQUE
========================= */

function attack() {

  if (gameOver || victory || !enemy) return;

  const element = elements[selectedElement];

  const dx = mouse.x - player.x;
  const dy = mouse.y - player.y;

  const distance = Math.hypot(dx, dy) || 1;

  projectiles.push({

    x: player.x,
    y: player.y,

    vx: (dx / distance) * element.speed,
    vy: (dy / distance) * element.speed,

    damage: element.damage,

    color: element.color,

    element: selectedElement,

    life: 100

  });

}


/* =========================
   METEORO
========================= */

function useMeteor() {

  if (!meteorUnlocked || gameOver || victory) {
    return;
  }

  meteorUnlocked = false;
  meteorButton.disabled = true;

  message.textContent =
    "☄️ METEORO! O poder secreto foi lançado!";

  const targetX = enemy.x;
  const targetY = enemy.y;

  for (let i = 0; i < 20; i++) {

    setTimeout(() => {

      createExplosion(
        targetX + (Math.random() - 0.5) * 60,
        targetY + (Math.random() - 0.5) * 60,
        "#ff8b2e",
        5
      );

    }, i * 30);

  }

  enemy.hp -= 80;

  if (enemy.hp <= 0) {
    enemyDefeated();
  }

}


/* =========================
   INIMIGO DERROTADO
========================= */

function enemyDefeated() {

  createExplosion(
    enemy.x,
    enemy.y,
    "#ffd75a",
    35
  );

  if (currentEnemy < enemyTypes.length - 1) {

    currentEnemy++;

    meteorUnlocked = true;
    meteorButton.disabled = false;

    message.textContent =
      "☄️ METEORO DESBLOQUEADO! Prepare-se para o próximo inimigo!";

    setTimeout(() => {

      if (!gameOver && !victory) {
        createEnemy();
      }

    }, 1000);

  } else {

    victory = true;

    message.textContent =
      "🏆 VITÓRIA! Gregório venceu todos os inimigos!";

  }

}


/* =========================
   MOVIMENTO
========================= */

function updatePlayer(dt) {

  let dx = 0;
  let dy = 0;

  if (keys["w"] || keys["ArrowUp"]) {
    dy--;
  }

  if (keys["s"] || keys["ArrowDown"]) {
    dy++;
  }

  if (keys["a"] || keys["ArrowLeft"]) {
    dx--;
  }

  if (keys["d"] || keys["ArrowRight"]) {
    dx++;
  }

  if (dx !== 0 || dy !== 0) {

    const distance = Math.hypot(dx, dy);

    player.x += (dx / distance) * player.speed * dt;
    player.y += (dy / distance) * player.speed * dt;

  }

  player.x = Math.max(
    30,
    Math.min(WIDTH - 30, player.x)
  );

  player.y = Math.max(
    55,
    Math.min(HEIGHT - 35, player.y)
  );

}


/* =========================
   MOVIMENTO DO INIMIGO
========================= */

function updateEnemy(dt) {

  if (!enemy || gameOver || victory) return;

  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;

  const distance = Math.hypot(dx, dy) || 1;

  if (distance > 75) {

    enemy.x +=
      (dx / distance) *
      enemy.speed *
      dt;

    enemy.y +=
      (dy / distance) *
      enemy.speed *
      dt;

  } else {

    if (Math.random() < 0.018 * dt) {

      player.hp -= 7;

      createExplosion(
        player.x,
        player.y,
        "#d94b42",
        5
      );

      if (player.hp <= 0) {

        player.hp = 0;

        gameOver = true;

        message.textContent =
          "💀 Você foi derrotado! Pressione R para tentar novamente.";

      }

    }

  }

  if (enemy.hitTimer > 0) {
    enemy.hitTimer -= dt;
  }

}


/* =========================
   PROJÉTEIS
========================= */

function updateProjectiles(dt) {

  for (const projectile of projectiles) {

    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;

    projectile.life -= dt;

    const distance = Math.hypot(
      projectile.x - enemy.x,
      projectile.y - enemy.y
    );

    if (
      distance <
      enemy.size + 10 &&
      projectile.life > 0
    ) {

      enemy.hp -= projectile.damage;

      enemy.hitTimer = 7;

      projectile.life = 0;

      createExplosion(
        enemy.x,
        enemy.y,
        projectile.color,
        7
      );

      if (enemy.hp <= 0) {
        enemyDefeated();
      }

    }

  }

  projectiles = projectiles.filter(projectile =>

    projectile.life > 0 &&
    projectile.x > -30 &&
    projectile.x < WIDTH + 30 &&
    projectile.y > -30 &&
    projectile.y < HEIGHT + 30

  );

}


/* =========================
   PARTÍCULAS
========================= */

function createExplosion(x, y, color, amount) {

  for (let i = 0; i < amount; i++) {

    const angle =
      Math.random() * Math.PI * 2;

    const speed =
      1 + Math.random() * 3;

    particles.push({

      x,
      y,

      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,

      color,

      life: 25 + Math.random() * 30

    });

  }

}


function updateParticles(dt) {

  for (const particle of particles) {

    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;

    particle.vy += 0.04 * dt;

    particle.life -= dt;

  }

  particles = particles.filter(
    particle => particle.life > 0
  );

}


/* =========================
   DESENHO
========================= */

function drawForest() {

  ctx.fillStyle = "#18331d";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  /* Caminho */

  ctx.fillStyle = "#31572c";
  ctx.fillRect(
    0,
    HEIGHT / 2 - 40,
    WIDTH,
    80
  );

  /* Grama */

  ctx.fillStyle = "#244b27";

  for (let i = 0; i < 70; i++) {

    const x = (i * 137) % WIDTH;
    const y = 50 + ((i * 83) % 440);

    ctx.fillRect(x, y, 5, 5);
    ctx.fillRect(x + 6, y + 4, 4, 3);

  }

  /* Árvores */

  for (let i = 0; i < 12; i++) {

    const treeX =
      30 + i * 85;

    const treeY =
      55 + (i % 4) * 100;

    drawTree(treeX, treeY);

  }

  /* Bordas */

  ctx.strokeStyle = "#80683e";
  ctx.lineWidth = 5;

  ctx.strokeRect(
    12,
    35,
    WIDTH - 24,
    HEIGHT - 50
  );

}


function drawTree(x, y) {

  ctx.fillStyle = "#4a3020";

  ctx.fillRect(
    x - 5,
    y,
    12,
    30
  );

  ctx.fillStyle = "#173c22";

  ctx.fillRect(
    x - 22,
    y - 20,
    46,
    27
  );

  ctx.fillStyle = "#28602e";

  ctx.fillRect(
    x - 29,
    y - 8,
    60,
    25
  );

}


/* =========================
   DESENHAR PLAYER
========================= */

function drawPlayer() {

  ctx.fillStyle = "#101010";

  ctx.fillRect(
    player.x - 13,
    player.y + 17,
    26,
    6
  );

  /* Cabeça */

  ctx.fillStyle = "#d8c09b";

  ctx.fillRect(
    player.x - 9,
    player.y - 17,
    18,
    15
  );

  /* Corpo */

  ctx.fillStyle = "#4d72b9";

  ctx.fillRect(
    player.x - 12,
    player.y - 2,
    24,
    22
  );

  /* Chapéu */

  ctx.fillStyle = "#d3a85e";

  ctx.fillRect(
    player.x - 16,
    player.y - 20,
    32,
    5
  );

  /* Olhos */

  ctx.fillStyle = "#201a14";

  ctx.fillRect(
    player.x - 6,
    player.y - 10,
    3,
    3
  );

  ctx.fillRect(
    player.x + 4,
    player.y - 10,
    3,
    3
  );

  ctx.fillStyle = "#f7edca";
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "center";

  ctx.fillText(
    elements[selectedElement].name,
    player.x,
    player.y + 38
  );

  ctx.textAlign = "left";

}


/* =========================
   DESENHAR INIMIGO
========================= */

function drawEnemy() {

  ctx.fillStyle = "#111";

  ctx.fillRect(
    enemy.x - enemy.size,
    enemy.y + enemy.size,
    enemy.size * 2,
    7
  );

  ctx.fillStyle =
    enemy.hitTimer > 0
      ? "#ffffff"
      : enemy.color;

  ctx.fillRect(
    enemy.x - enemy.size,
    enemy.y - enemy.size,
    enemy.size * 2,
    enemy.size * 2
  );

  /* Olhos */

  ctx.fillStyle = "#211915";

  ctx.fillRect(
    enemy.x - enemy.size * 0.5,
    enemy.y - enemy.size * 0.35,
    5,
    5
  );

  ctx.fillRect(
    enemy.x + enemy.size * 0.3,
    enemy.y - enemy.size * 0.35,
    5,
    5
  );

  /* Nome */

  ctx.textAlign = "center";

  ctx.fillStyle = "#f2e3ad";
  ctx.font = "bold 13px monospace";

  ctx.fillText(
    enemy.name,
    enemy.x,
    enemy.y - enemy.size - 20
  );

  /* Barra de vida */

  ctx.fillStyle = "#351b1b";

  ctx.fillRect(
    enemy.x - 35,
    enemy.y - enemy.size - 12,
    70,
    7
  );

  ctx.fillStyle = "#d84b42";

  ctx.fillRect(
    enemy.x - 35,
    enemy.y - enemy.size - 12,
    70 * Math.max(
      0,
      enemy.hp / enemy.maxHp
    ),
    7
  );

  ctx.textAlign = "left";

}


/* =========================
   DESENHAR MAGIAS
========================= */

function drawProjectiles() {

  for (const projectile of projectiles) {

    ctx.fillStyle = projectile.color;

    ctx.fillRect(
      projectile.x - 6,
      projectile.y - 6,
      12,
      12
    );

    if (projectile.element === "fire") {

      ctx.fillStyle = "#ffd15a";

      ctx.fillRect(
        projectile.x - 3,
        projectile.y - 10,
        6,
        5
      );

    }

    if (projectile.element === "water") {

      ctx.fillStyle = "#b7e4ff";

      ctx.fillRect(
        projectile.x - 3,
        projectile.y - 8,
        6,
        4
      );

    }

    if (projectile.element === "earth") {

      ctx.fillStyle = "#d2e39c";

      ctx.fillRect(
        projectile.x - 9,
        projectile.y - 3,
        5,
        6
      );

    }

  }

}


/* =========================
   PARTÍCULAS
========================= */

function drawParticles() {

  for (const particle of particles) {

    ctx.fillStyle = particle.color;

    ctx.fillRect(
      particle.x,
      particle.y,
      5,
      5
    );

  }

}


/* =========================
   HUD
========================= */

function updateHUD() {

  const percentage =
    Math.max(
      0,
      player.hp / player.maxHp
    ) * 100;

  healthBar.style.width =
    `${percentage}%`;

  healthText.textContent =
    Math.ceil(player.hp);

}


/* =========================
   LOOP
========================= */

function update(dt) {

  if (gameOver || victory) return;

  updatePlayer(dt);
  updateEnemy(dt);
  updateProjectiles(dt);
  updateParticles(dt);

  updateHUD();

}


function draw() {

  drawForest();

  drawProjectiles();
  drawParticles();

  drawEnemy();
  drawPlayer();

  if (gameOver || victory) {

    ctx.fillStyle =
      "rgba(0, 0, 0, 0.65)";

    ctx.fillRect(
      0,
      0,
      WIDTH,
      HEIGHT
    );

    ctx.textAlign = "center";

    ctx.fillStyle =
      victory
        ? "#ffd75a"
        : "#e95b4d";

    ctx.font =
      "bold 36px monospace";

    ctx.fillText(
      victory ? "🏆 VITÓRIA!" : "💀 DERROTA!",
      WIDTH / 2,
      HEIGHT / 2
    );

    ctx.fillStyle = "#fff";

    ctx.font =
      "bold 15px monospace";

    ctx.fillText(
      victory
        ? "A Floresta Mágica foi salva!"
        : "Pressione R para tentar novamente",
      WIDTH / 2,
      HEIGHT / 2 + 35
    );

    ctx.textAlign = "left";

  }

}


function gameLoop(time) {

  const dt =
    Math.min(
      2,
      (time - lastTime) / 16.67 || 1
    );

  lastTime = time;

  update(dt);
  draw();

  requestAnimationFrame(gameLoop);

}


/* =========================
   TECLADO
========================= */

window.addEventListener(
  "keydown",
  event => {

    keys[event.key] = true;

    if (
      ["1", "2", "3", "4"].includes(event.key)
    ) {

      const elementsList = [
        "fire",
        "water",
        "air",
        "earth"
      ];

      selectElement(
        elementsList[
          Number(event.key) - 1
        ]
      );

    }

    if (event.code === "Space") {

      event.preventDefault();

      attack();

    }

    if (event.key.toLowerCase() === "m") {

      useMeteor();

    }

    if (event.key.toLowerCase() === "r") {

      startGame();

    }

  }
);


window.addEventListener(
  "keyup",
  event => {

    keys[event.key] = false;

  }
);


/* =========================
   MOUSE
========================= */

function updateMouse(event) {

  const rect =
    canvas.getBoundingClientRect();

  mouse.x =
    (event.clientX - rect.left)
    * WIDTH /
    rect.width;

  mouse.y =
    (event.clientY - rect.top)
    * HEIGHT /
    rect.height;

}


canvas.addEventListener(
  "pointermove",
  updateMouse
);


canvas.addEventListener(
  "pointerdown",
  event => {

    updateMouse(event);

    attack();

  }
);


/* =========================
   BOTÕES DE ELEMENTOS
========================= */

document
  .querySelectorAll(".power[data-element]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        selectElement(
          button.dataset.element
        );

      }
    );

  });


/* =========================
   BOTÕES
========================= */

attackButton.addEventListener(
  "click",
  attack
);

meteorButton.addEventListener(
  "click",
  useMeteor
);

restartButton.addEventListener(
  "click",
  startGame
);


/* =========================
   CONTROLES MOBILE
========================= */

document
  .querySelectorAll(".dpad button")
  .forEach(button => {

    const key =
      button.dataset.key;

    button.addEventListener(
      "pointerdown",
      event => {

        event.preventDefault();

        keys[key] = true;

      }
    );

    button.addEventListener(
      "pointerup",
      () => {

        keys[key] = false;

      }
    );

    button.addEventListener(
      "pointercancel",
      () => {

        keys[key] = false;

      }
    );

    button.addEventListener(
      "pointerleave",
      () => {

        keys[key] = false;

      }
    );

  });


/* =========================
   TELA CHEIA
========================= */

fullscreenBtn.addEventListener(
  "click",
  async () => {

    try {

      if (!document.fullscreenElement) {

        await document.documentElement.requestFullscreen();

      } else {

        await document.exitFullscreen();

      }

    } catch (error) {

      console.log(
        "Tela cheia não disponível:",
        error
      );

    }

  }
);


document.addEventListener(
  "fullscreenchange",
  () => {

    fullscreenBtn.textContent =
      document.fullscreenElement
        ? "✕ Sair da tela cheia"
        : "⛶ Tela cheia";

  }
);


/* =========================
   INICIAR
========================= */

startGame();

requestAnimationFrame(gameLoop);
