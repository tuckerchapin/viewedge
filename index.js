const c = document.getElementById('c'),
    ctx = c.getContext('2d');

const {
  shapesCount = 2,
  pointCount = 5,
  colorSpeed = 10,
  movementSpeed = 2,
  afterimages = 10,
  afterimageSpacing = 20,
} = Object.fromEntries([...new URLSearchParams(location.search)].map(arr => [arr[0], parseInt(arr[1])]));

console.log(Object.fromEntries([...new URLSearchParams(location.search)].map(arr => [arr[0], parseInt(arr[1])])));

c.width = window.innerWidth;
c.height = window.innerHeight;

function randomColor() {
  return [
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255),
    Math.floor(Math.random() * 255)
  ];
}

function drawIntermediates(steps, colorA, colorB) {
  const rStep = (colorB[0] - colorA[0]) / steps;
  const gStep = (colorB[1] - colorA[1]) / steps;
  const bStep = (colorB[2] - colorA[2]) / steps;
  return Array(steps).fill(0).map((color, i) => [
    Math.round(colorA[0] + rStep * i),
    Math.round(colorA[1] + gStep * i),
    Math.round(colorA[2] + bStep * i),
  ])
};

function Point() {
    this.x = parseInt(Math.random() * c.width);
    this.y = parseInt(Math.random() * c.height);
    this.xVel = parseInt(Math.random() * 2) == 1 ? 1 : -1;
    this.yVel = parseInt(Math.random() * 2) == 1 ? 1 : -1;
}

function Shape() {
    this.colorSteps = drawIntermediates(colorSpeed, randomColor(), randomColor());
    this.colorStep = 0;
    this.points = [];
    this.history = Array(afterimages).fill(0).map(

    );

    for(let i = 0; i < pointCount; i++) {
        this.points.push(new Point());
    }
    this.history.push(this.points);

    this.draw = () => {
        ctx.strokeStyle = '#' + this.colorSteps[this.colorStep].map((color) => color.toString(16).padStart(2, '0')).join('');
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);

        for(let i = 1; i < this.points.length; i++) {
            const p = this.points[i];

            ctx.lineTo(p.x, p.y);
        }

        ctx.lineTo(this.points[0].x, this.points[0].y);
        ctx.closePath();
        ctx.stroke();
    }

    this.update = () => {
        this.colorStep += 1;
        if (this.colorStep === colorSpeed) {
          this.colorSteps = drawIntermediates(colorSpeed, this.colorSteps.pop(), randomColor());
          this.colorStep = 0;
        }

        for(let i = 0; i < this.points.length; i++) {
            const p = this.points[i];

            p.x += p.xVel * movementSpeed;
            p.y += p.yVel * movementSpeed;

            if(p.x > c.width) p.xVel = Math.abs(p.xVel) * -1;
            if(p.x < 0) p.xVel = Math.abs(p.xVel);

            if(p.y > c.height) p.yVel = Math.abs(p.yVel) * -1;
            if(p.y < 0) p.yVel = Math.abs(p.yVel);


        }
    }
}

const shapes = Array(shapesCount).fill(0).map(el => (new Shape()));

function render() {
    ctx.fillStyle = '#00';
    ctx.fillRect(0, 0, c.width, c.height);
    shapes.forEach(shape => {
      shape.update();
      shape.draw();
    })
}

window.requestAnimFrame = (() => {
    return  window.requestAnimationFrame   ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

(function animloop(){
    requestAnimFrame(animloop);
    render();
})();