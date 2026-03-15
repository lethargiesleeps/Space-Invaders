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
        else if(this.xPos + this.width > this.game.width) this.xPos = this.game.width - this.width * 0.5;
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

    const game = new Game(canvas);

    function animate() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        game.render(context);
        requestAnimationFrame(animate);
    }

    animate();
});