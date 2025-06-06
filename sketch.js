let fazendeiro;
let imgFazendeiro;
let imgFruta;
let imgChao;
let imgCeu;
let imgObstaculo;
let imgParticulaFruta;
let imgParticulaObstaculo;
let imgControles;

let frutas = [];
let particulas = [];
let obstaculos = [];
let pontuacao = 0;

const MAX_PARTICULAS = 300;  // Limite de partículas para evitar lag

function preload() {
  imgFazendeiro = loadImage('artworks-MZbz7brgWuYB4RpH-VdRAqw-t500x500.jpg');
  imgFruta = loadImage('carlinho.png');
  imgChao = loadImage('gramo.jpg');
  imgCeu = loadImage('textura-do-ceu_14223-97.avif');
  imgObstaculo = loadImage('tilojo.webp');
  imgParticulaFruta = loadImage('carlinho.png');
  imgParticulaObstaculo = loadImage('tilojo.webp');
}

function setup() {
  createCanvas(800, 600);
  fazendeiro = new Fazendeiro();
  frameRate(60);
}

function draw() {
  background(135, 206, 235);

  // Céu
  let tileWidthCeu = 800;
  let tileHeightCeu = 1000;
  for (let x = 0; x < width; x += tileWidthCeu) {
    for (let y = 0; y < height - 100; y += tileHeightCeu) {
      image(imgCeu, x, y, tileWidthCeu, tileHeightCeu);
    }
  }

  // Chão
  let chaoY = height - 100;
  let tileWidth = 200;
  for (let x = 0; x < width; x += tileWidth) {
    image(imgChao, x, chaoY, tileWidth, 100);
  }

  // Partículas (do fim para o começo para remover com segurança)
  for (let i = particulas.length - 1; i >= 0; i--) {
    particulas[i].update();
    particulas[i].show();
    if (particulas[i].isDead()) {
      particulas.splice(i, 1);
    }
  }
  // Limita partículas para não acumular demais
  if (particulas.length > MAX_PARTICULAS) {
    particulas.splice(0, particulas.length - MAX_PARTICULAS);
  }

  // Frutas
for (let i = frutas.length - 1; i >= 0; i--) {
  frutas[i].update();
  frutas[i].show();

  if (frutas[i].caught(fazendeiro)) {
    pontuacao += 10;        // só soma se foi pega
    frutas.splice(i, 1);    // remove a fruta pega
  } else if (frutas[i].y > height + frutas[i].size) {
    frutas.splice(i, 1);    // remove a fruta que caiu fora, sem somar pontos
  }
}


  // Obstáculos
  for (let i = obstaculos.length - 1; i >= 0; i--) {
    obstaculos[i].update();
    obstaculos[i].show();

    // Remove obstáculos que saíram da tela (abaixo)
    if (obstaculos[i].hits(fazendeiro)) {
      gameOver();
      return; // Para o jogo depois do gameOver
    } else if (obstaculos[i].y > height + obstaculos[i].size) {
      obstaculos.splice(i, 1);
    }
  }

  // Fazendeiro
  fazendeiro.update();
  fazendeiro.show();

  // Criar novas frutas e obstáculos periodicamente
  if (frameCount % 60 === 0) {
    frutas.push(new Fruta());
  }
  if (frameCount % 150 === 0) {
    obstaculos.push(new Obstaculo());
  }

  // Pontuação
  textSize(32);
  fill(0);
  text("Pontuação: " + pontuacao, 20, 40);

  // Mostrar FPS para debug
  fill(0);
  textSize(16);
  text("FPS: " + floor(frameRate()), width - 70, 30);
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    fazendeiro.setDirection(-1);
  } else if (keyCode === RIGHT_ARROW) {
    fazendeiro.setDirection(1);
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    fazendeiro.setDirection(0);
  }
}

// Classe do Fazendeiro
class Fazendeiro {
  constructor() {
    this.x = width / 2;
    this.y = height - 150;
    this.width = 50;
    this.height = 50;
    this.speed = 5;
    this.direction = 0;
  }

  setDirection(dir) {
    this.direction = dir;
  }

  update() {
    // Criar partícula ao andar
    if (this.direction !== 0 && particulas.length < MAX_PARTICULAS) {
      particulas.push(new Particula(this.x + this.width / 2, this.y + this.height));
    }

    this.x += this.direction * this.speed;
    this.x = constrain(this.x, 0, width - this.width);
  }

  show() {
    image(imgFazendeiro, this.x, this.y, this.width, this.height);
  }
}

class Fruta {
  constructor() {
    this.x = random(width);
    this.y = 0;
    this.size = 30;
    this.speed = random(2, 5);
    this.angulo = random(TWO_PI);
  }

  update() {
    this.y += this.speed;
    this.angulo += 0.1;

    // Só gera partícula se não estourar limite
    if (frameCount % 5 === 0 && particulas.length < MAX_PARTICULAS) {
      particulas.push(new ParticulaImagemFruta(this.x + this.size / 2, this.y + this.size / 2));
    }
  }

  show() {
    push();
    translate(this.x + this.size / 2, this.y + this.size / 2);
    rotate(this.angulo);
    imageMode(CENTER);
    image(imgFruta, 0, 0, this.size, this.size);
    pop();
  }

  caught(fazendeiro) {
    return (
      this.x > fazendeiro.x &&
      this.x < fazendeiro.x + fazendeiro.width &&
      this.y > fazendeiro.y &&
      this.y < fazendeiro.y + fazendeiro.height
    );
  }
}

class Obstaculo {
  constructor() {
    this.x = random(width);
    this.y = 0;
    this.size = 40;
    this.speed = random(3, 6);
    this.angulo = random(TWO_PI);
  }

  update() {
    this.y += this.speed;
    this.angulo += 0.1;

    if (frameCount % 5 === 0 && particulas.length < MAX_PARTICULAS) {
      particulas.push(new ParticulaImagemObstaculo(this.x + this.size / 2, this.y + this.size / 2));
    }
  }

  show() {
    push();
    translate(this.x + this.size / 2, this.y + this.size / 2);
    rotate(this.angulo);
    imageMode(CENTER);
    image(imgObstaculo, 0, 0, this.size, this.size);
    pop();
  }

  hits(fazendeiro) {
    return (
      this.x > fazendeiro.x &&
      this.x < fazendeiro.x + fazendeiro.width &&
      this.y > fazendeiro.y &&
      this.y < fazendeiro.y + fazendeiro.height
    );
  }
}

class ParticulaImagemFruta {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1.5, 1.5);
    this.vy = random(-1, -2);
    this.alpha = 255;
    this.size = random(10, 20);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 6;
  }

  isDead() {
    return this.alpha <= 0;
  }

  show() {
    tint(255, this.alpha);
    image(imgParticulaFruta, this.x, this.y, this.size, this.size);
    noTint();
  }
}

class ParticulaImagemObstaculo {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-1, 1);
    this.vy = random(0.5, 2);
    this.alpha = 255;
    this.size = random(10, 18);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 5;
  }

  isDead() {
    return this.alpha <= 0;
  }

  show() {
    tint(255, this.alpha);
    image(imgParticulaObstaculo, this.x, this.y, this.size, this.size);
    noTint();
  }
}

class Particula {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = random(-0.5, 0.5);
    this.vy = random(-1, 0);
    this.alpha = 255;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 10;
  }

  isDead() {
    return this.alpha <= 0;
  }

  show() {
    noStroke();
    fill(150, 100, 50, this.alpha);
    ellipse(this.x, this.y, 8);
  }
}

function gameOver() {
  noLoop();
  fill(0);
  textSize(48);
  text("Fim de Jogo!", width / 2 - 150, height / 2);
  textSize(32);
  text("Pontuação Final: " + pontuacao, width / 2 - 120, height / 2 + 50);
}