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
let enemyProjectiles = [];
let particles = [];

let gameOver = false;
let victory = false;

let currentEnemy = 0;
let meteorUnlocked = false;

let lastTime = 0;
let attackCooldown = 0;
let enemyAttackCooldown = 0;


/* =====================================================
   PODERES
===================================================== */

const elements = {

  fire: {
    name: "Fogo",
    color: "#ff6335",
    damage: 15,
    speed: 8,
    cooldown: 18
  },

  water: {
    name: "Água",
    color: "#45a8ff",
    damage: 12,
    speed: 10,
    cooldown: 14
  },

  air: {
    name: "Ar",
    color: "#d9eee0",
    damage: 9,
    speed: 13,
    cooldown: 9
  },

  earth: {
    name: "Terra",
    color: "#91c456",
    damage: 13,
    speed: 5,
    cooldown: 25
  }

};


/* =====================================================
   10 INIMIGOS
===================================================== */

const enemyTypes = [

  {
    name: "Goblin da Mata",
    hp: 70,
    speed: 0.75,
    size: 19,
    color: "#7d9e43",
    damage: 5,
    attackSpeed: 150
  },

  {
    name: "Lobo Selvagem",
    hp: 90,
    speed: 1.25,
    size: 18,
    color: "#77746a",
    damage: 6,
    attackSpeed: 125
  },

  {
    name: "Espírito da Água",
    hp: 115,
    speed: 0.85,
    size: 21,
    color: "#397fbd",
    damage: 7,
    attackSpeed: 110
  },

  {
    name: "Orc da Floresta",
    hp: 145,
    speed: 0.72,
    size: 27,
    color: "#54763b",
    damage: 9,
    attackSpeed: 100
  },

  {
    name: "Mago Sombrio",
    hp: 125,
    speed: 0.65,
    size: 22,
    color: "#744da4",
    damage: 11,
    attackSpeed: 80
  },

  {
    name: "Golem de Pedra",
    hp: 220,
    speed: 0.48,
    size: 32,
    color: "#77776d",
    damage: 12,
    attackSpeed: 115
  },

  {
    name: "Dragão Verde",
    hp: 260,
    speed: 0.70,
    size: 34,
    color: "#3e914e",
    damage: 13,
    attackSpeed: 90
  },

  {
    name: "Guardião da Floresta",
    hp: 300,
    speed: 0.82,
    size: 36,
    color: "#315e37",
    damage: 14,
    attackSpeed: 80
  },

  {
    name: "Goblin Elemental",
    hp: 380,
    speed: 0.95,
    size: 38,
    color: "#a44242",
    damage: 16,
    attackSpeed: 65
  },

  {
    name: "☄️ REI METEORO ☄️",
    hp: 550,
    speed: 0.85,
    size: 45,
    color: "#c35b2c",
    damage: 20,
    attackSpeed: 50
  }

];


/* =====================================================
   JOGADOR
===================================================== */

const player = {

  x: 150,
  y: HEIGHT / 2,

  hp: 100,
  maxHp: 100,

  speed: 3.2

};


/* =====================================================
   CRIAR INIMIGO
===================================================== */

let enemy;

function createEnemy() {

  const data = enemyTypes[currentEnemy];

  enemy = {

    x: WIDTH - 150,

    y:
      90 +
      Math.random() *
      (HEIGHT - 180),

    hp: data.hp,

    maxHp: data.hp,

    speed: data.speed,

    size: data.size,

    color: data.color,

    damage: data.damage,

    attackSpeed: data.attackSpeed,

    hitTimer: 0

  };

  enemyAttackCooldown = 80;

  enemyName.textContent = data.name;

  enemyCounter.textContent =
    `INIMIGO ${currentEnemy + 1} / ${enemyTypes.length}`;

  if (currentEnemy === 0) {

    message.textContent =
      "⚔️ O primeiro inimigo apareceu!";

  } else if (currentEnemy === 9) {

    message.textContent =
      "☄️ O REI METEORO chegou! Prepare-se!";

  } else {

    message.textContent =
      `⚔️ Inimigo ${currentEnemy + 1}! Continue lutando!`;

  }

}


/* =====================================================
   SELECIONAR ELEMENTO
===================================================== */

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


/* =====================================================
   ATAQUE DO JOGADOR
===================================================== */

function attack() {

  if (
    gameOver ||
    victory ||
    !enemy ||
    attackCooldown > 0
  ) {

    return;

  }

  const element = elements[selectedElement];

  const dx = mouse.x - player.x;
  const dy = mouse.y - player.y;

  const distance =
    Math.hypot(dx, dy) || 1;

  projectiles.push({

    x: player.x,

    y: player.y,

    vx:
      (dx / distance) *
      element.speed,

    vy:
      (dy / distance) *
      element.speed,

    damage: element.damage,

    color: element.color,

    element: selectedElement,

    life: 100

  });

  attackCooldown =
    element.cooldown;

}


/* =====================================================
   METEORO
===================================================== */

function useMeteor() {

  if (
    !meteorUnlocked ||
    gameOver ||
    victory
  ) {

    return;

  }

  meteorUnlocked = false;

  meteorButton.disabled = true;

  message.textContent =
    "☄️ METEORO! O poder secreto atingiu o inimigo!";

  const targetX = enemy.x;
  const targetY = enemy.y;

  for (let i = 0; i < 30; i++) {

    setTimeout(() => {

      createExplosion(

        targetX +
        (Math.random() - 0.5) * 80,

        targetY +
        (Math.random() - 0.5) * 80,

        "#ff8b2e",

        5

      );

    }, i * 20);

  }

  /* Meteor agora tira bastante vida,
     mas não mata automaticamente os chefes */

  enemy.hp -= 100;

  enemy.hitTimer = 15;

  if (enemy.hp <= 0) {

    enemyDefeated();

  }

}


/* =====================================================
   DERROTAR INIMIGO
===================================================== */

function enemyDefeated() {

  createExplosion(
    enemy.x,
    enemy.y,
    "#ffd75a",
    45
  );

  if (
    currentEnemy <
    enemyTypes.length - 1
  ) {

    currentEnemy++;

    /*
      A cada inimigo derrotado,
      Gregório recupera um pouco de vida.
    */

    player.hp = Math.min(
      player.maxHp,
      player.hp + 18
    );

    /*
      O Meteoro fica disponível
      depois de cada vitória.
    */

    meteorUnlocked = true;

    meteorButton.disabled = false;

    message.textContent =
      "☄️ METEORO DESBLOQUEADO! O próximo inimigo está chegando!";

    setTimeout(() => {

      if (
        !gameOver &&
        !victory
      ) {

        createEnemy();

      }

    }, 1200);

  } else {

    victory = true;

    message.textContent =
      "🏆 VITÓRIA! Gregório derrotou o REI METEORO!";

  }

}


/* =====================================================
   MOVIMENTO DO JOGADOR
===================================================== */

function updatePlayer(dt) {

  let dx = 0;
  let dy = 0;

  if (
    keys["w"] ||
    keys["W"] ||
    keys["ArrowUp"]
  ) {

    dy--;

  }

  if (
    keys["s"] ||
    keys["S"] ||
    keys["ArrowDown"]
  ) {

    dy++;

  }

  if (
    keys["a"] ||
    keys["A"] ||
    keys["ArrowLeft"]
  ) {

    dx--;

  }

  if (
    keys["d"] ||
    keys["D"] ||
    keys["ArrowRight"]
  ) {

    dx++;

  }

  if (
    dx !== 0 ||
    dy !== 0
  ) {

    const distance =
      Math.hypot(dx, dy);

    player.x +=
      (dx / distance) *
      player.speed *
      dt;

    player.y +=
      (dy / distance) *
      player.speed *
      dt;

  }

  player.x = Math.max(
    30,
    Math.min(
      WIDTH - 30,
      player.x
    )
  );

  player.y = Math.max(
    55,
    Math.min(
      HEIGHT - 35,
      player.y
    )
  );

}


/* =====================================================
   MOVIMENTO DO INIMIGO
===================================================== */

function updateEnemy(dt) {

  if (
    !enemy ||
    gameOver ||
    victory
  ) {

    return;

  }

  const dx =
    player.x - enemy.x;

  const dy =
    player.y - enemy.y;

  const distance =
    Math.hypot(dx, dy) || 1;


  /*
    Alguns inimigos perseguem rapidamente.
  */

  if (distance > 85) {

    enemy.x +=
      (dx / distance) *
      enemy.speed *
      dt;

    enemy.y +=
      (dy / distance) *
      enemy.speed *
      dt;

  }


  /*
    Ataques de perto
  */

  if (
    distance <= 85 &&
    enemyAttackCooldown <= 0
  ) {

    player.hp -= enemy.damage;

    createExplosion(
      player.x,
      player.y,
      "#d94b42",
      8
    );

    enemyAttackCooldown =
      enemy.attackSpeed;

    if (player.hp <= 0) {

      player.hp = 0;

      gameOver = true;

      message.textContent =
        "💀 Gregório foi derrotado! Pressione R para tentar novamente.";

    }

  }


  /*
    Ataques à distância
    para inimigos mais avançados.
  */

  if (
    currentEnemy >= 4 &&
    distance > 120 &&
    enemyAttackCooldown <= 0
  ) {

    const speed = 4;

    enemyProjectiles.push({

      x: enemy.x,

      y: enemy.y,

      vx:
        (dx / distance) *
        speed,

      vy:
        (dy / distance) *
        speed,

      damage:
        enemy.damage,

      life: 150,

      color:
        enemy.color

    });

    enemyAttackCooldown =
      enemy.attackSpeed;

  }

  enemyAttackCooldown -= dt;

  if (enemy.hitTimer > 0) {

    enemy.hitTimer -= dt;

  }

}


/* =====================================================
   PROJÉTEIS DO JOGADOR
===================================================== */

function updateProjectiles(dt) {

  for (
    const projectile
    of projectiles
  ) {

    projectile.x +=
      projectile.vx * dt;

    projectile.y +=
      projectile.vy * dt;

    projectile.life -= dt;


    const distance =
      Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );


    if (
      distance <
      enemy.size + 10 &&
      projectile.life > 0
    ) {

      enemy.hp -=
        projectile.damage;

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


  projectiles =
    projectiles.filter(
      projectile =>

        projectile.life > 0 &&

        projectile.x > -30 &&
        projectile.x < WIDTH + 30 &&

        projectile.y > -30 &&
        projectile.y < HEIGHT + 30

    );

}


/* =====================================================
   PROJÉTEIS DOS INIMIGOS
===================================================== */

function updateEnemyProjectiles(dt) {

  for (
    const projectile
    of enemyProjectiles
  ) {

    projectile.x +=
      projectile.vx * dt;

    projectile.y +=
      projectile.vy * dt;

    projectile.life -= dt;


    const distance =
      Math.hypot(
        projectile.x - player.x,
        projectile.y - player.y
      );


    if (
      distance < 18 &&
      projectile.life > 0
    ) {

      player.hp -=
        projectile.damage;

      projectile.life = 0;

      createExplosion(
        player.x,
        player.y,
        "#e55a48",
        6
      );


      if (player.hp <= 0) {

        player.hp = 0;

        gameOver = true;

        message.textContent =
          "💀 Gregório foi derrotado! Pressione R.";

      }

    }

  }


  enemyProjectiles =
    enemyProjectiles.filter(
      projectile =>

        projectile.life > 0 &&

        projectile.x > -30 &&
        projectile.x < WIDTH + 30 &&

        projectile.y > -30 &&
        projectile.y < HEIGHT + 30

    );

}


/* =====================================================
   PARTÍCULAS
===================================================== */

function createExplosion(
  x,
  y,
  color,
  amount
) {

  for (
    let i = 0;
    i < amount;
    i++
  ) {

    const angle =
      Math.random() *
      Math.PI *
      2;

    const speed =
      1 +
      Math.random() * 3;

    particles.push({

      x,
      y,

      vx:
        Math.cos(angle) *
        speed,

      vy:
        Math.sin(angle) *
        speed,

      color,

      life:
        25 +
        Math.random() * 30

    });

  }

}


function updateParticles(dt) {

  for (
    const particle
    of particles
  ) {

    particle.x +=
      particle.vx * dt;

    particle.y +=
      particle.vy * dt;

    particle.vy +=
      0.04 * dt;

    particle.life -= dt;

  }

  particles =
    particles.filter(
      particle =>
        particle.life > 0
    );

}


/* =====================================================
   FLORESTA
===================================================== */

function drawForest() {

  ctx.fillStyle = "#18331d";

  ctx.fillRect(
    0,
    0,
    WIDTH,
    HEIGHT
  );


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

  for (
    let i = 0;
    i < 80;
    i++
  ) {

    const x =
      (i * 137) %
      WIDTH;

    const y =
      50 +
      ((i * 83) % 440);

    ctx.fillRect(
      x,
      y,
      5,
      5
    );

    ctx.fillRect(
      x + 6,
      y + 4,
      4,
      3
    );

  }


  /* Árvores */

  for (
    let i = 0;
    i < 13;
    i++
  ) {

    const treeX =
      30 +
      i * 82;

    const treeY =
      55 +
      (i % 4) * 100;

    drawTree(
      treeX,
      treeY
    );

  }


  /* Bordas */

  ctx.strokeStyle =
    "#80683e";

  ctx.lineWidth = 5;

  ctx.strokeRect(
    12,
    35,
    WIDTH - 24,
    HEIGHT - 50
  );

}


/* =====================================================
   ÁRVORE
===================================================== */

function drawTree(
  x,
  y
) {

  ctx.fillStyle =
    "#4a3020";

  ctx.fillRect(
    x - 5,
    y,
    12,
    30
  );

  ctx.fillStyle =
    "#173c22";

  ctx.fillRect(
    x - 22,
    y - 20,
    46,
    27
  );

  ctx.fillStyle =
    "#28602e";

  ctx.fillRect(
    x - 29,
    y - 8,
    60,
    25
  );

}


/* =====================================================
   JOGADOR
===================================================== */

function drawPlayer() {

  ctx.fillStyle = "#101010";

  ctx.fillRect(
    player.x - 13,
    player.y + 17,
    26,
    6
  );


  /* Cabeça */

  ctx.fillStyle =
    "#d8c09b";

  ctx.fillRect(
    player.x - 9,
    player.y - 17,
    18,
    15
  );


  /* Corpo */

  ctx.fillStyle =
    "#4d72b9";

  ctx.fillRect(
    player.x - 12,
    player.y - 2,
    24,
    22
  );


  /* Chapéu */

  ctx.fillStyle =
    "#d3a85e";

  ctx.fillRect(
    player.x - 16,
    player.y - 20,
    32,
    5
  );


  /* Olhos */

  ctx.fillStyle =
    "#201a14";

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


  ctx.fillStyle =
    "#f7edca";

  ctx.font =
    "bold 12px monospace";

  ctx.textAlign =
    "center";

  ctx.fillText(
    elements[selectedElement].name,
    player.x,
    player.y + 38
  );

  ctx.textAlign =
    "left";

}


/* =====================================================
   INIMIGO
===================================================== */

function drawEnemy() {

  ctx.fillStyle =
    "#111";

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

  ctx.fillStyle =
    "#211915";

  ctx.fillRect(
    enemy.x -
      enemy.size * 0.5,

    enemy.y -
      enemy.size * 0.35,

    5,
    5
  );

  ctx.fillRect(
    enemy.x +
      enemy.size * 0.3,

    enemy.y -
      enemy.size * 0.35,

    5,
    5
  );


  /* Nome */

  ctx.textAlign =
    "center";

  ctx.fillStyle =
    "#f2e3ad";

  ctx.font =
    "bold 13px monospace";

  ctx.fillText(
    enemyTypes[currentEnemy].name,
    enemy.x,
    enemy.y -
      enemy.size -
      20
  );


  /* Vida */

  ctx.fillStyle =
    "#351b1b";

  ctx.fillRect(
    enemy.x - 40,
    enemy.y -
      enemy.size -
      12,
    80,
    7
  );

  ctx.fillStyle =
    "#d84b42";

  ctx.fillRect(
    enemy.x - 40,
    enemy.y -
      enemy.size -
      12,

    80 *
      Math.max(
        0,
        enemy.hp /
          enemy.maxHp
      ),

    7
  );


  ctx.textAlign =
    "left";

}


/* =====================================================
   MAGIAS
===================================================== */

function drawProjectiles() {

  for (
    const projectile
    of projectiles
  ) {

    ctx.fillStyle =
      projectile.color;

    ctx.fillRect(
      projectile.x - 6,
      projectile.y - 6,
      12,
      12
    );


    if (
      projectile.element ===
      "fire"
    ) {

      ctx.fillStyle =
        "#ffd15a";

      ctx.fillRect(
        projectile.x - 3,
        projectile.y - 10,
        6,
        5
      );

    }


    if (
      projectile.element ===
      "water"
    ) {

      ctx.fillStyle =
        "#b7e4ff";

      ctx.fillRect(
        projectile.x - 3,
        projectile.y - 8,
        6,
        4
      );

    }


    if (
      projectile.element ===
      "earth"
    ) {

      ctx.fillStyle =
        "#d2e39c";

      ctx.fillRect(
        projectile.x - 9,
        projectile.y - 3,
        5,
        6
      );

    }

  }


  /* Ataques dos inimigos */

  for (
    const projectile
    of enemyProjectiles
  ) {

    ctx.fillStyle =
      projectile.color;

    ctx.fillRect(
      projectile.x - 7,
      projectile.y - 7,
      14,
      14
    );

  }

}


/* =====================================================
   PARTÍCULAS
===================================================== */

function drawParticles() {

  for (
    const particle
    of particles
  ) {

    ctx.fillStyle =
      particle.color;

    ctx.fillRect(
      particle.x,
      particle.y,
      5,
      5
    );

  }

}


/* =====================================================
   HUD
===================================================== */

function updateHUD() {

  const percentage =
    Math.max(
      0,
      player.hp /
        player.maxHp
    ) * 100;

  healthBar.style.width =
    `${percentage}%`;

  healthText.textContent =
    Math.ceil(player.hp);

}


/* =====================================================
   LOOP DO JOGO
===================================================== */

function update(dt) {

  if (
    gameOver ||
    victory
  ) {

    return;

  }

  if (attackCooldown > 0) {

    attackCooldown -= dt;

  }

  updatePlayer(dt);

  updateEnemy(dt);

  updateProjectiles(dt);

  updateEnemyProjectiles(dt);

  updateParticles(dt);

  updateHUD();

}


function draw() {

  drawForest();

  drawProjectiles();

  drawParticles();

  drawEnemy();

  drawPlayer();


  /* Tela final */

  if (
    gameOver ||
    victory
  ) {

    ctx.fillStyle =
      "rgba(0, 0, 0, 0.68)";

    ctx.fillRect(
      0,
      0,
      WIDTH,
      HEIGHT
    );

    ctx.textAlign =
      "center";


    ctx.fillStyle =
      victory
        ? "#ffd75a"
        : "#e95b4d";

    ctx.font =
      "bold 36px monospace";

    ctx.fillText(
      victory
        ? "🏆 VITÓRIA!"
        : "💀 DERROTA!",
      WIDTH / 2,
      HEIGHT / 2
    );


    ctx.fillStyle =
      "#fff";

    ctx.font =
      "bold 15px monospace";

    ctx.fillText(

      victory
        ? "Gregório salvou a Floresta Mágica!"
        : "Pressione R para tentar novamente",

      WIDTH / 2,
      HEIGHT / 2 + 38

    );


    ctx.textAlign =
      "left";

  }

}


function gameLoop(time) {

  const dt =
    Math.min(
      2,
      (time - lastTime) /
        16.67 || 1
    );

  lastTime = time;

  update(dt);

  draw();

  requestAnimationFrame(
    gameLoop
  );

}


/* =====================================================
   TECLADO
===================================================== */

window.addEventListener(
  "keydown",
  event => {

    keys[event.key] = true;


    if (
      ["1", "2", "3", "4"]
        .includes(event.key)
    ) {

      const elementList = [

        "fire",
        "water",
        "air",
        "earth"

      ];

      selectElement(
        elementList[
          Number(event.key) - 1
        ]
      );

    }


    if (
      event.code === "Space"
    ) {

      event.preventDefault();

      attack();

    }


    if (
      event.key.toLowerCase() ===
      "m"
    ) {

      useMeteor();

    }


    if (
      event.key.toLowerCase() ===
      "r"
    ) {

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


/* =====================================================
   MOUSE
===================================================== */

function updateMouse(event) {

  const rect =
    canvas.getBoundingClientRect();

  mouse.x =
    (event.clientX -
      rect.left) *
    WIDTH /
    rect.width;

  mouse.y =
    (event.clientY -
      rect.top) *
    HEIGHT /
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


/* =====================================================
   BOTÕES DOS ELEMENTOS
===================================================== */

document
  .querySelectorAll(
    ".power[data-element]"
  )
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


/* =====================================================
   BOTÕES
===================================================== */

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


/* =====================================================
   CONTROLES MOBILE
===================================================== */

document
  .querySelectorAll(
    ".dpad button"
  )
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


/* =====================================================
   TELA CHEIA
===================================================== */

fullscreenBtn.addEventListener(
  "click",
  async () => {

    try {

      if (
        !document.fullscreenElement
      ) {

        await document
          .documentElement
          .requestFullscreen();

      } else {

        await document
          .exitFullscreen();

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


/* =====================================================
   INICIAR JOGO
===================================================== */

function startGame() {

  player.x = 150;
  player.y = HEIGHT / 2;

  player.hp = 100;

  currentEnemy = 0;

  gameOver = false;
  victory = false;

  meteorUnlocked = false;

  attackCooldown = 0;
  enemyAttackCooldown = 0;

  projectiles = [];
  enemyProjectiles = [];
  particles = [];

  meteorButton.disabled = true;

  createEnemy();

  updateHUD();

}


startGame();

requestAnimationFrame(
  gameLoop
);
