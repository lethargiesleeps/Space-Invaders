class Player {
    constructor(game) {
        this.game = game;
        this.width = 100;
        this.height = 100;
        this.xPos = this.game.width * 0.5 - this.width * 0.5;
        this.yPos = this.game.height - this.height;
        this.speed = 5;
    }
    draw(context) {
        context.fillRect(this.xPos, this.yPos, this.width, this.height);
    }

    update() {
        //X Move
        if(this.game.keys.indexOf('a') > -1 || this.game.keys.indexOf('ArrowLeft') > -1) this.xPos -= this.speed;
        if(this.game.keys.indexOf('d') > -1 || this.game.keys.indexOf('ArrowRight') > -1) this.xPos += this.speed;

        //X Boundaries
        if(this.xPos < -this.width * 0.5) this.xPos = -this.width * 0.5;
        else if(this.xPos > this.game.width - this.width * 0.5) this.xPos = this.game.width - this.width * 0.5;
    }

    shoot() {
        const projectile = this.game.getProjectile();
        if(projectile) projectile.start(this.xPos + this.width * 0.5, this.yPos);
    }
}

class Projectile {
    constructor() {
        this.width = 8;
        this.height = 20;
        this.xPos = 0;
        this.yPos = 0;
        this.speed = 20;
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
        this.xPos = xPos - this.width * 0.5; //offset so always in center of player
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
        this.width;
        this.height;
        //Position within canvas
        this.xPos;
        this.yPos;
        //Position relative to enemy wave grid
        this.wavePositionX = wavePositionX;
        this.wavePositionY = wavePositionY;
    }

    draw(context) {
        context.strokeRect(this.xPos, this.yPos, this.width, this.height);
    }

    update(x, y) {
        this.xPos = x + this.wavePositionX;
        this.yPos = y + this.wavePositionY;
    }
}

class EnemyWave {
    constructor(game) {
        this.game = game;
        this.width = this.game.columns * this.game.enemySize;
        this.height = this.game.rows * this.game.enemySize;
        this.xPos = 0;
        this.yPos = -this.height;
        this.speedX = 3;
        this.speedY = 0;
        this.enemies = [];
        this.create();
    }

    render(context) {
        if(this.yPos < 0) this.yPos += 5
        this.speedY = 0;
        context.strokeRect(this.xPos, this.yPos, this.width, this.height);

        if(this.xPos > this.game.width - this.width || this.xPos < 0) {
            this.speedX *= -1;
            this.speedY = this.game.enemySize;
        }

        this.xPos += this.speedX;
        this.yPos += this.speedY;

        this.enemies.forEach(enemy => {
            enemy.update(this.xPos, this.yPos);
            enemy.draw(context);
        });
    }

    create() {
        for(let y = 0; y < this.game.rows; y++) {
            for(let x = 0; x < this.game.columns; x++) {
                this.enemies.push(new Enemy(this.game, x * this.game.enemySize, y * this.game.enemySize));
            }
        }
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
        this.numberOfProjectiles = 10;
        this.createProjectiles();

        //Grid
        this.columns = 3;
        this.rows = 3;
        this.enemySize = 60;
        this.enemyWaves = [];
        this.enemyWaves.push(new EnemyWave(this));

        //Event Listeners
        window.addEventListener('keydown', event => {
            if(this.keys.indexOf(event.key) !== -1) return;
            this.keys.push(event.key);
            console.log(`Key: ${event.key}\nCode: ${event.code}`);
            if(event.code === 'Space') this.player.shoot();
        });

        window.addEventListener('keyup', event => {
            const index = this.keys.indexOf(event.key);
            if(index > -1) this.keys.splice(index, 1);
        });
    }

    render(context) {
        this.player.draw(context);
        this.player.update();

        this.projectiles.forEach(p => {
                p.update();
                p.draw(context);
            }
        );

        this.enemyWaves.forEach(wave => {
            wave.render(context);
        });
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
}

window.addEventListener('load', () => {
    const canvas = document.getElementById('canvas1');
    const context = canvas.getContext('2d');

    canvas.width = 600;
    canvas.height = 800;

    context.fillStyle = 'white';
    context.strokeStyle = 'white';

    const game = new Game(canvas);

    function animate() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        game.render(context);
        requestAnimationFrame(animate);
    }

    animate();
});