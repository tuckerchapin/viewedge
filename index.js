const c = document.getElementById('c'),
  ctx = c.getContext('2d');

const {
  shapesCount = 2,
  pointCount = 5,
  colorSpeed = 1000,
  movementSpeed = 5,
  afterimages = 100,
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

    const startingPoints = Array(pointCount).fill(0).map(() => new Point());
    this.points = [
      ...Array(afterimages).fill(0).map((a, i) =>  startingPoints.map(startingPoint => ({
        x: startingPoint.x + startingPoint.xVel * movementSpeed * i,
        y: startingPoint.y + startingPoint.yVel * movementSpeed * i,
      }))),
      startingPoints
    ];

    this.draw = () => {
      this.points.forEach((point, i) => {
        ctx.strokeStyle = `rgba(${this.colorSteps[this.colorStep].join(',')},${1 / ((afterimages - 1 - i) )})`;
        // ctx.strokeStyle = `rgb(${this.colorSteps[this.colorStep].join(',')})`;
        ctx.beginPath();
        ctx.moveTo(point[0].x, point[0].y);

        point.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));

        ctx.lineTo(point[0].x, point[0].y);
        ctx.closePath();
        ctx.stroke();
      });
    }

    this.update = () => {
      this.colorStep += 1;
      if (this.colorStep === colorSpeed) {
        this.colorSteps = drawIntermediates(colorSpeed, this.colorSteps.pop(), randomColor());
        this.colorStep = 0;
      }

      this.points.shift();
      const last = this.points.slice(-1)[0];
      this.points.push(last.map(lastPoint => {
        const newPoint = {
          x: lastPoint.x + lastPoint.xVel * movementSpeed,
          y: lastPoint.y + lastPoint.yVel * movementSpeed,
          xVel: lastPoint.xVel,
          yVel: lastPoint.yVel,
        };

        if(newPoint.x > c.width) newPoint.xVel = Math.abs(newPoint.xVel) * -1;
        if(newPoint.x < 0) newPoint.xVel = Math.abs(newPoint.xVel);

        if(newPoint.y > c.height) newPoint.yVel = Math.abs(newPoint.yVel) * -1;
        if(newPoint.y < 0) newPoint.yVel = Math.abs(newPoint.yVel);

        return newPoint;
      }));
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