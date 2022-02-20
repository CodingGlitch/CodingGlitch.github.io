$(document).ready( function () {

//Créé par Anthony PRUYS et Alexandre PRUYS
console.log("██████╗ ██████╗ ██╗   ██╗██╗   ██╗███████╗\n██╔══██╗██╔══██╗██║   ██║╚██╗ ██╔╝██╔════╝\n██████╔╝██████╔╝██║   ██║ ╚████╔╝ ███████╗\n██╔═══╝ ██╔══██╗██║   ██║  ╚██╔╝  ╚════██║\n██║     ██║  ██║╚██████╔╝   ██║   ███████║\n╚═╝     ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚══════╝")

let company = [
  ["Exotrails", "Aérospatial", "Description", "assets/logo_exotrail_full.e32341e.png", "l.addr@mail.com", "monsite.com"],
  ["SpaceDreams", "Aérospatial", "Canart", "assets/SpaceDreamslogo.webp"]
];

let sectors = [
  ["IT", "planet1.png"],
  ["Aérospatial", "planet2.png"],
  ["Internet provider", "planet3.png"],
  ["Service provider", "planet4.png"],
  ["Financial services", "planet0.png"],
];

jQuery(".sidebar .logo").hide()

jQuery("#sector").append("<option value=\"\">All sectors</option>");
for (var i = 0; i < sectors.length; i++) {
  jQuery("#sector").append("<option value='"+sectors[i][0]+"'>"+sectors[i][0]+"</option>");
}

let image = new Image(60, 45);
image.src = 'test.png';

jQuery("body").on("change", "#sector", function (event) { //Update the transparency of each node when necessary
  for (var i = 0; i < particles.length; i++) {
    if (this.value != "") {
      if (particles[i].industry[1] == this.value) particles[i].transparent = false;
      else particles[i].transparent = true;
    }
    else {
      particles[i].transparent = false;
    }
  }
});



//Shuffle to create different link colors
for (var i = 0; i < company.length; i++) {
  var randomIndex = Math.floor(Math.random() * company.length);
  var randomIndexValue = company[randomIndex];
  company[randomIndex] = company[i];
  company[i] = randomIndexValue;
}

//Get the canvas
const canvas = document.getElementById('mycanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth*0.8;
canvas.height = window.innerHeight*0.8;
let particles = [];

let stars = [];

window.addEventListener('resize', function (e) {
  canvas.width = window.innerWidth*0.8;
  canvas.height = window.innerHeight*0.8;
});

const mouse = {
  x: undefined,
  y: undefined,
}



function randomSign() {
  var sign = Math.floor(Math.random() * 2-1)
    if (sign == 0) {
      return 1
    }
    return -1
}

canvas.addEventListener('click', function (e) {
  mouse.x = e.x;
  mouse.y = e.y;
  for (var i = 0; i < particles.length; i++) {
    if (particles[i].hovered()) {
      jQuery(".sidebar h1").html(particles[i].industry[0]);
      jQuery(".sidebar .sector").html(particles[i].industry[1]);
      jQuery(".sidebar .description").html(particles[i].industry[2]);
      jQuery(".sidebar .logo")[0].src = particles[i].industry[3];
      jQuery(".sidebar .logo").show();
    }
  }
})

canvas.addEventListener('mousemove', function(e) {
  mouse.x = e.x;
  mouse.y = e.y;
  for (var i = 0; i < particles.length; i++) {
    particles[i].size = particles[i].originSize;
    if (particles[i].hovered()) {
      particles[i].size = particles[i].increaseSize;
    }
  }
})


class Particle {
  constructor(planet, x, y, industry) {
    this.x = x;
    this.y = y;
    this.selected = false;
    this.size = Math.random() * 5 + 15;
    this.originSize = this.size;
    this.increaseSize = 25;
    this.spd = 0.25;
    this.direction = [Math.random()*Math.PI*randomSign(), Math.random()*Math.PI*randomSign()];
    this.cx = 0;
    this.cy = 0;
    this.limit = 5;
    this.industry = industry;

    this.image = new Image();
    this.image.src = "assets/"+planet;
  }

  hovered() {
    if (mouse.x < this.x +this.size && mouse.x > this.x-this.size*2) {
      if (mouse.y < this.y +this.size && mouse.y > this.y-this.size*2) {
        return true;
      }
    }
  }

  update() {
    this.x += this.spd * Math.cos(this.direction[0]);
    this.y += this.spd * Math.sin(this.direction[1]);
    this.direction[0] += Math.random()*Math.PI*0.005 * randomSign();
    this.direction[1] += Math.random()*Math.PI*0.005 * randomSign();

    if (this.direction[0] > Math.PI) {
      this.direction[0] = 0;
    }
    if (this.direction[1] > Math.PI*2) {
      this.direction[1] = 0;
    }
    if (this.x >= canvas.width - 20 && this.direction[0] <= Math.PI/2) {
      this.direction[0] = Math.random() * Math.PI*0.75;
    }
    if (this.y >= canvas.height - 20 && this.direction[1] <= Math.PI) {
      this.direction[1] = Math.random() * Math.PI*1.5;
    }
    if (this.x <= this.size*2 && Math.cos(this.direction[0]) < 0) {
      this.direction[0] = Math.random()*Math.PI/2;
    }
    if(this.y <= this.size*2 && Math.sin(this.direction[1]) < 0) {
      this.direction[1] = Math.random() * Math.PI*0.5;
    }
  }

  draw() {
    if (this.transparent || this.hovered()) {
      ctx.globalAlpha = 0.2;
    }
    ctx.drawImage(this.image, this.x-this.size, this.y-this.size, this.size*2, this.size*2);
    ctx.globalAlpha = 1;
    ctx.strokeText(this.industry[0], this.x-this.industry[0].length*2.25, this.y-this.size);
    if (this.hovered()) {
      var image = new Image();
      image.src = this.industry[3];
      ctx.drawImage(image, this.x-this.size, this.y-this.size, this.size*2, this.size*2);
    }
  }
}

class Star {
  constructor() {
    this.x = -300 + Math.random() * (canvas.width+400);
    this.y = -300 + Math.random() * (canvas.height+400);
    this.currentTransparency = 0;
    this.transparency = Math.random()*0.75;
    this.size = Math.floor(Math.random()*1.5 + 1);
    this.life = Math.random() * 400 + 120;
    this.spd = Math.random()/4;
    this.spdY = Math.random()/4;
    this.direction = randomSign();
    this.directionY = randomSign();
  }

  update() {
    this.life -= 1;
    this.x -= this.spd*this.direction;
    this.y -= this.spdY*this.directionY;
    if (this.life <= 0 || this.x <= -300) {
      this.transparency = 0;
    }
    if (this.currentTransparency < this.transparency) {
      this.currentTransparency += (this.transparency-this.currentTransparency) / 20;
    }
    else if (this.currentTransparency > this.transparency){
      this.currentTransparency -= (this.currentTransparency-this.transparency) / 20;
    }
  }

  draw() {
    ctx.fillStyle = 'rgba(255, 255, 255,'+this.currentTransparency+')';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}
var satelliteImages = []
for (var i = 0; i < 3; i++) {
  satelliteImages.push(new Image());
  satelliteImages[i].src = "assets/satellite"+i+".png";
}

class Satellite {
  constructor(image) {
    this.size = 40;
    this.x = Math.random() < 0.5 ? -40-this.size*3:canvas.width+40;
    this.y = Math.random() * (canvas.height-this.size*2)+canvas.height+this.size;
    this.spd = Math.random() * 1.25 * -Math.sign(this.x)+2;
    this.image = satelliteImages[image];
    this.dead = false;
  }

  update() {
    this.x += this.spd;
    if (this.x < -40-this.size*3 || this.x > canvas.width+40) {
      this.dead = true;
    }
  }

  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.size*2.5, this.size);
  }
}

function handleParticles() {
  for (var i = 0; i < particles.length; i++) {
    particles[i].update();

    for (var j = i + 1; j < particles.length; j+=4) { //Dynamic calculation of the link
      const dx = (particles[j].x) - (particles[i].x);
      const dy = (particles[j].y) - (particles[i].y);
      const distance = dx * dx + dy * dy;
      //if (true) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgb(255, 255, 255)';
        if (jQuery("#sector")[0].value != "") {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        }
        ctx.lineWidth = 0.25;
        ctx.moveTo(particles[i].x+particles[i].cx, particles[i].y+particles[i].cy);
        ctx.lineTo(particles[j].x+particles[j].cx, particles[j].y+particles[j].cy);
        ctx.stroke();
      //}
    }
  }
  for (var i = 0; i < particles.length; i++) {
    particles[i].draw();
  }
}

for (var i = 0; i < 200; i++) {
  stars.push(new Star);
}

function handleStars() {
  for (var i = 0; i < stars.length; i++) {
    stars[i].update();
    stars[i].draw();
    if (stars[i].currentTransparency <= 0.025) {
      stars.splice(i, 1);
      stars.push(new Star);
    }
  }
}


for (var i = 0; i < company.length; i++) {
  var created = false;
  for (j = 0; j < sectors.length; j++) {
    if (company[i][1] == sectors[j][0] && !created) {
      var x = Math.random() * canvas.width;
      var y = Math.random() * canvas.height;
      if (particles.length < 1) {
        created = true;
      }

      if (!created) {
        while (created == false) {
          created = true;
          console.log("looping");
          for (k = 0; k < particles.length; k++) {
            if (x < particles[k].x + 40 && x > particles[k].x - 60 && y < particles[k].y + 40 && y > particles[k].y - 40) {
              x = Math.random() * canvas.width;
              y = Math.random() * canvas.height;
              created = false;
              break;
            }
          }
        }
      }
      console.log("Created particle");
      particles.push(new Particle(sectors[j][1], x,  y, company[i]));
    }
  }
}

let eventCounter = new Date()
let eventObjects = [];

function handleEvents() {

  if (Date.now()/1000 - eventCounter.getTime()/1000 > 15) {
    eventCounter.setTime(Date.now());
    var eventType = Math.floor(Math.random() * 3)
    console.log(eventType);
    if (eventType == 0) {
      eventObjects.push(new Satellite(0));
    }
  }

  for (var i = 0; i <  eventObjects.length; i++) {
    eventObjects[i].update();
    eventObjects[i].draw();
    if (eventObjects[i].dead) {
      eventObjects.splice(i, 1);
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
  handleStars();
  handleEvents();
  handleParticles();
  requestAnimationFrame(animate);
}

animate();
});
