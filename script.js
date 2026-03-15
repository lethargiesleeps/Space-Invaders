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
        if(this.xPos < 0) this.xPos = 0;
        else if(this.xPos + this.width > this.game.width) this.xPos = this.game.width - this.width;
    }
}

class Projectile {

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

        //Event Listeners
        window.addEventListener('keydown', event => {
            if(this.keys.indexOf(event.key) !== -1) return;
            this.keys.push(event.key);
        });

        window.addEventListener('keyup', event => {
            const index = this.keys.indexOf(event.key);
            if(index > -1) this.keys.splice(index, 1);
        });
    }

    render(context) {
        this.player.draw(context);
        this.player.update();
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