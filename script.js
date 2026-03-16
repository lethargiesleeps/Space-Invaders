const KEYS = {
    LEFT: 'a',
    RIGHT: 'd',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    R_LOW: 'r',
    R_UPPER: 'R',
    SPACE: 'Space',
}

const DEFAULTS = {
    HALF_VALUE: 0.5,
    INDEX_OF: -1,
    SCORE_INCREMENT: 100,
    PLAYER_SPEED: 5,
    PLAYER_LIVES: 3,
    PLAYER_WIDTH: 100,
    PLAYER_HEIGHT: 100,
    PROJECTILE_WIDTH: 8,
    PROJECTILE_HEIGHT: 20,
    PROJECTILE_SPEED: 20,
    PROJECTILE_POOL_MAX: 10,
    ENEMY_WAVE_SPEED_X: 2,
    ENEMY_WAVE_SPEED_Y: 0,
    ENEMY_STARTING_WAVE: 1,
    ENEMY_SIZE: 80,
    GRID_ROW_START: 2,
    GRID_COLUMN_START: 2,
    ANIMATION_INTERVAL: 150
}

const ENEMY_TYPES = {
    BEETLEMORPH: 'beetlemorph'
}

const EVENTS = {
    KEY_DOWN: 'keydown',
    KEY_UP: 'keyup',
    LOAD: 'load',
}

class Player {
    constructor(game) {
        this.game = game;
        this.width = DEFAULTS.PLAYER_WIDTH;
        this.height = DEFAULTS.PLAYER_HEIGHT;
        this.xPos = this.game.width * DEFAULTS.HALF_VALUE - this.width * DEFAULTS.HALF_VALUE;
        this.yPos = this.game.height - this.height;
        this.speed = DEFAULTS.PLAYER_SPEED;
        this.lives = DEFAULTS.PLAYER_LIVES;
    }
    draw(context) {
        context.fillRect(this.xPos, this.yPos, this.width, this.height);
    }

    update() {
        //X Move
        if(this.game.keys.indexOf(KEYS.LEFT) > DEFAULTS.INDEX_OF || this.game.keys.indexOf(KEYS.ARROW_LEFT) > DEFAULTS.INDEX_OF) this.xPos -= this.speed;
        if(this.game.keys.indexOf(KEYS.RIGHT) > DEFAULTS.INDEX_OF || this.game.keys.indexOf(KEYS.ARROW_RIGHT) > DEFAULTS.INDEX_OF) this.xPos += this.speed;

        //X Boundaries
        if(this.xPos < -this.width * DEFAULTS.HALF_VALUE) this.xPos = -this.width * DEFAULTS.HALF_VALUE;
        else if(this.xPos > this.game.width - this.width * DEFAULTS.HALF_VALUE) this.xPos = this.game.width - this.width * DEFAULTS.HALF_VALUE;
    }

    shoot() {
        const projectile = this.game.getProjectile();
        if(projectile) projectile.start(this.xPos + this.width * DEFAULTS.HALF_VALUE, this.yPos);
    }

    restart() {
        this.xPos = this.game.width * DEFAULTS.HALF_VALUE - this.width * DEFAULTS.HALF_VALUE;
        this.yPos = this.game.height - this.height;
        this.lives = DEFAULTS.PLAYER_LIVES;
    }
}

class Projectile {
    constructor() {
        this.width = DEFAULTS.PROJECTILE_WIDTH;
        this.height = DEFAULTS.PROJECTILE_HEIGHT;
        this.xPos = 0;
        this.yPos = 0;
        this.speed = DEFAULTS.PROJECTILE_SPEED;
        this.free = true;
    }

    draw(context) {
        if(!this.free) {
            context.fillRect(this.xPos, this.yPos, this.width, this.height);
        }
    }

    update() {
        if(!this.free) {
            this.yPos -= this.speed;
            if(this.yPos < -this.height) this.reset();
        }
    }

    start(xPos, yPos) {
        this.xPos = xPos - this.width * DEFAULTS.HALF_VALUE; //offset so always in center of player
        this.yPos = yPos;
        this.free = false;
    }

    reset() {
        this.free = true;
    }
}

class Enemy {
    constructor(game, wavePositionX, wavePositionY) {
        this.game = game;
        this.width = this.game.enemySize;
        this.height = this.game.enemySize;
        //Position within canvas
        this.xPos = 0;
        this.yPos = 0;
        //Position relative to enemy wave grid
        this.wavePositionX = wavePositionX;
        this.wavePositionY = wavePositionY;
        this.markedForDeletion = false;
        this.sourceWidth = this.game.enemySize;
        this.sourceHeight = this.game.enemySize;
        this.frameX = 0;
        this.frameY = 0;
        this.image = '';
        this.variations = 0;
        this.lives = 1;
        this.maxLives = 1;
        this.maxFrames = 0;
    }

    draw(context) {
        //context.strokeRect(this.xPos, this.yPos, this.width, this.height);
        context.drawImage(
            this.image,
            this.frameX * this.width,
            this.frameY * this.height,
            this.sourceWidth,
            this.sourceHeight,
            this.xPos,
            this.yPos,
            this.width,
            this.height
        );
    }

    update(x, y) {
        this.xPos = x + this.wavePositionX;
        this.yPos = y + this.wavePositionY;

        //Check collision enemies - projectiles
        this.game.projectiles.forEach(projectile => {
            if(!projectile.free && this.game.checkCollision(this, projectile) && this.lives > 0) {
                this.hit(1);
                projectile.reset();
            }
        });

        if(this.lives < 1) {
            if(this.game.spriteUpdate) this.frameX++;
            if(this.frameX > this.maxFrames) {
                this.markedForDeletion = true;
                if(!this.game.gameOver) this.game.score += DEFAULTS.SCORE_INCREMENT * this.maxLives;
            }
        }
        //Lose Conditions
        if(this.yPos + this.height > this.game.height) {
            this.game.gameOver = true;
            this.markedForDeletion = true;
        }

        if(this.game.checkCollision(this, this.game.player)) {
            this.markedForDeletion = true;

            if(!this.game.gameOver && this.game.score > 0) this.game.score -= DEFAULTS.SCORE_INCREMENT;
            this.game.player.lives--;
            if(this.game.player.lives < 1) this.game.gameOver = true;
        }
    }

    hit(damage) {
        this.lives -= damage;
    }
}

class EnemyWave {
    constructor(game) {
        this.game = game;
        this.width = this.game.columns * this.game.enemySize;
        this.height = this.game.rows * this.game.enemySize;
        this.xPos = this.game.width * DEFAULTS.HALF_VALUE - this.width * DEFAULTS.HALF_VALUE;
        this.yPos = -this.height;
        this.speedX = Math.random() < DEFAULTS.HALF_VALUE ? -1 : 1;
        this.speedY = DEFAULTS.ENEMY_WAVE_SPEED_Y;
        this.enemies = [];
        this.nextWaveTriggered = false;
        this.create();
    }

    render(context) {
        if(this.yPos < 0) this.yPos += 5
        this.speedY = 0;

        if(this.xPos > this.game.width - this.width || this.xPos < 0) {
            this.speedX *= DEFAULTS.INDEX_OF;
            this.speedY = this.game.enemySize;
        }

        this.xPos += this.speedX;
        this.yPos += this.speedY;

        this.enemies.forEach(enemy => {
            enemy.update(this.xPos, this.yPos);
            enemy.draw(context);
        });

        this.enemies = this.enemies.filter(obj => !obj.markedForDeletion);
    }

    create() {
        for(let y = 0; y < this.game.rows; y++) {
            for(let x = 0; x < this.game.columns; x++) {
                this.enemies.push(new Beetlemorph(this.game, x * this.game.enemySize, y * this.game.enemySize));
            }
        }
    }
}

class Beetlemorph extends Enemy {
    constructor(game, wavePositionX, wavePositionY) {
        super(game, wavePositionX, wavePositionY);
        this.image = document.getElementById(ENEMY_TYPES.BEETLEMORPH);
        this.variations = 4;
        this.frameX = 0;
        this.frameY = Math.floor(Math.random() * this.variations);
        this.maxFrames = 3;

    }
}

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.player = new Player(this);
        this.keys = [];
        this.projectiles = [];
        this.fired = false;
        this.numberOfProjectiles = DEFAULTS.PROJECTILE_POOL_MAX;
        this.createProjectiles();

        //Grid
        this.columns = DEFAULTS.GRID_COLUMN_START;
        this.rows = DEFAULTS.GRID_ROW_START;
        this.enemySize = DEFAULTS.ENEMY_SIZE;
        this.enemyWaves = [];
        this.enemyWaves.push(new EnemyWave(this));
        this.enemyWaveCount = DEFAULTS.ENEMY_STARTING_WAVE;
        this.score = 0;
        this.gameOver = false;
        this.spriteUpdate = false;
        this.spriteTimer = 0;
        this.spriteInterval = DEFAULTS.ANIMATION_INTERVAL;

        //Event Listeners
        window.addEventListener(EVENTS.KEY_DOWN, event => {
            if(event.code === KEYS.SPACE && !this.fired) this.player.shoot();
            this.fired = true;
            if((event.key === KEYS.R_LOW || event.key === KEYS.R_UPPER) && this.gameOver) this.restart();
            if(this.keys.indexOf(event.key) === DEFAULTS.INDEX_OF) this.keys.push(event.key.toLowerCase())
        });

        window.addEventListener(EVENTS.KEY_UP, event => {
            this.fired = false;
            const index = this.keys.indexOf(event.key);
            if(index > DEFAULTS.INDEX_OF) this.keys.splice(index, 1);
        });
    }

    render(context, deltaTime) {
        if(this.spriteTimer > this.spriteInterval) {
            this.spriteUpdate = true;
            this.spriteTimer = 0;
        }
        else {
            this.spriteUpdate = false;
            this.spriteTimer += deltaTime;
        }
        this.drawStatusText(context);
        this.player.draw(context);
        this.player.update();

        this.projectiles.forEach(p => {
                p.update();
                p.draw(context);
            }
        );

        this.enemyWaves.forEach(wave => {
            wave.render(context);
            if(wave.enemies.length < 1 && !wave.nextWaveTriggered && !this.gameOver) {
                this.newWave();
                this.enemyWaveCount++;
                wave.nextWaveTriggered = true;
                //this.player.lives++;
            }
        });
    }

    restart() {
        this.player.restart();
        this.columns = DEFAULTS.GRID_COLUMN_START;
        this.rows = DEFAULTS.GRID_ROW_START;
        this.enemyWaveCount = DEFAULTS.ENEMY_STARTING_WAVE;
        this.enemyWaves = [];
        this.enemyWaves.push(new EnemyWave(this));
        this.gameOver = false;
        this.score = 0;
    }

    newWave() {
        if(Math.random() < DEFAULTS.HALF_VALUE && this.columns * this.enemySize < this.width * 0.8)
            this.columns++;
        else if(this.rows * this.enemySize < this.height * 0.6)
            this.rows++;

        this.enemyWaves.push(new EnemyWave(this));
    }
    //Create Projectiles
    createProjectiles() {
        for(let i = 0; i < this.numberOfProjectiles; i++) {
            this.projectiles.push(new Projectile());
        }
    }

    getProjectile() {
        for(let i = 0; i < this.projectiles.length; i++) {
            if(this.projectiles[i].free) return this.projectiles[i];
        }
    }

    //Collisions
    checkCollision(item1, item2) {
        return(
            item1.xPos < item2.xPos + item2.width &&
            item1.xPos + item1.width > item2.xPos &&
            item1.yPos < item2.yPos + item2.height &&
            item1.yPos + item1.height > item2.yPos
        );
    }

    drawStatusText(context) {
        context.save();
        context.shadowOffsetX = 2;
        context.shadowOffsetY = 2;
        context.shadowColor = 'black';

        context.fillText(`Score: ${this.score}`, 20, 40);
        context.fillText(`Wave: ${this.enemyWaveCount}`, 20, 80);

        for(let i = 0; i < this.player.lives; i++) {
            context.fillRect(20 + 10 * i, 100, 5, 20);
        }

        if(this.gameOver) {
            context.textAlign = 'center';
            context.font = '100px Impact';
            context.fillText('GAME OVER', this.width * DEFAULTS.HALF_VALUE, this.height * DEFAULTS.HALF_VALUE);
            context.font = '20px Impact';
            context.fillText('Press R to restart', this.width * DEFAULTS.HALF_VALUE, this.height * DEFAULTS.HALF_VALUE + 30);
        }
        context.restore();
    }
}

window.addEventListener(EVENTS.LOAD, () => {
    const canvas = document.getElementById('canvas1');
    const context = canvas.getContext('2d');

    canvas.width = 600;
    canvas.height = 800;

    context.fillStyle = 'white';
    context.strokeStyle = 'white';
    context.lineWidth = 5;
    context.font = '30px Impact';

    const game = new Game(canvas);

    let lastTime = 0;
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        context.clearRect(0, 0, canvas.width, canvas.height);
        game.render(context, deltaTime);
        requestAnimationFrame(animate);
    }

    animate(0);
});