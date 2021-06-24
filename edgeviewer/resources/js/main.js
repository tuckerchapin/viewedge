const c = document.getElementById('c'),
  ctx = c.getContext('2d'),
  center = { x: window.innerWidth / 2, y: window.innerHeight / 2 }


c.width = window.innerWidth;
c.height = window.innerHeight;

const {
  shapesCount = 2,
  pointCount = 4,
  colorSpeed = 500,
  movementSpeed = 5,
  afterimages = 50,
} = Object.fromEntries([...new URLSearchParams(location.search)].map(arr => [arr[0], parseInt(arr[1])]));

console.log(Object.fromEntries([...new URLSearchParams(location.search)].map(arr => [arr[0], parseInt(arr[1])])));


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

function Point(x, y, xVel, yVel) {
  this.x = x || parseInt(Math.random() * c.width);
  this.y = y || parseInt(Math.random() * c.height);
  this.xVel = xVel || parseInt(Math.random() * 2) == 1 ? 1 : -1;
  this.yVel = yVel || parseInt(Math.random() * 2) == 1 ? 1 : -1;
}

function Shape() {
    this.colorSteps = drawIntermediates(colorSpeed, randomColor(), randomColor());
    this.colorStep = 0;

    const startingPoints = Array(pointCount).fill(0).map(() => new Point());
    this.points = [
      ...Array(afterimages).fill(0).map((a, i) =>
        startingPoints.map(startingPoint =>
          new Point(startingPoint.x + startingPoint.xVel * movementSpeed * i, startingPoint.y + startingPoint.yVel * movementSpeed * i)
        )
      ),
      startingPoints
    ];

    this.draw = () => {
      ctx.fillStyle = '#000';
      this.points.forEach((point, i) => {
        ctx.strokeStyle = `rgba(${this.colorSteps[this.colorStep].join(',')},${1 - ((afterimages - i) * .1)})`;
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

function Clock() {
  this.time = new Date;
  this.month = () => {
    switch (this.time.getMonth()) {
      case 0:
        return ['January', 'Jan'];
      case 1:
        return ['February', 'Feb'];
      case 2:
        return ['March', 'Mar'];
      case 3:
        return ['April', 'Apr'];
      case 4:
        return ['May', 'May'];
      case 5:
        return ['June', 'Jun'];
      case 6:
        return ['July', 'Jul'];
      case 7:
        return ['August', 'Aug'];
      case 8:
        return ['September', 'Sep'];
      case 9:
        return ['October', 'Oct'];
      case 10:
        return ['November', 'Nov'];
      case 11:
        return ['December', 'Dec'];
      default:
        return ['INVALID', 'ERR'];
    }
  };
  this.day = () => {
    switch (this.time.getDay()) {
      case 0:
        return ['Sunday', 'Sun', 'Su'];
      case 1:
        return ['Monday', 'Mon', 'M'];
      case 2:
        return ['Tuesday', 'Tue', 'Tu'];
      case 3:
        return ['Wednesday', 'Wed', 'W'];
      case 4:
        return ['Thursday', 'Thu', 'Th'];
      case 5:
        return ['Friday', 'Fri', 'F'];
      case 6:
        return ['Saturday', 'Sat', 'Sa'];
      default:
        return ['INVALID', 'ERR', '!!'];
    }
  };
  this.date = () => this.time.getDate();
  this.hour = () => this.time.getHours();
  this.minutes = () => this.time.getMinutes();
  this.seconds = () => this.time.getSeconds();
  this.milliseconds = () => this.time.getMilliseconds();
  this.timePosition = (r, x = center.x, y = center.y) => {
    const angle = ((this.seconds() * 1000 + this.milliseconds()) / 60000) * 2 * Math.PI - Math.PI * .5;
    return {
      x: r * Math.cos(angle) + x,
      y: r * Math.sin(angle) + y,
    }
  };

  this.draw = () => {
    const dateString = `${this.month()} ${this.date()}`;


    const timeString = `${this.hour()}:${this.minutes().toString().padStart(2, '0')}`
    const timePos = this.timePosition(center.x < center.y ? center.x / 2 : center.y / 2);

    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '10em sans-serif';
    ctx.fillText(timeString, timePos.x, timePos.y);
    const textSize = ctx.measureText(timeString);

    ctx.textBaseline = 'bottom';
    ctx.font = '3em sans-serif';
    ctx.fillText(this.day()[0].toUpperCase(), timePos.x, timePos.y - textSize.emHeightAscent / 2 - 20);

    ctx.textBaseline = 'top';
    ctx.font = '3em sans-serif';
    ctx.fillText(`${this.month()[1].toUpperCase()} ${this.date()}`, timePos.x, timePos.y + textSize.emHeightDescent / 2 + 20);
  };

  this.update = () => {
    this.time = new Date;
  };
}

const entities = [
  ...Array(shapesCount).fill(0).map(el => (new Shape())),
  new Clock(),
];

function render() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, c.width, c.height);
    entities.forEach(entity => {
      entity.update();
      entity.draw();
    });
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