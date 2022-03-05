$(document).ready( function () {

//Créé par Anthony PRUYS et Alexandre PRUYS
console.log("██████╗ ██████╗ ██╗   ██╗██╗   ██╗███████╗\n██╔══██╗██╔══██╗██║   ██║╚██╗ ██╔╝██╔════╝\n██████╔╝██████╔╝██║   ██║ ╚████╔╝ ███████╗\n██╔═══╝ ██╔══██╗██║   ██║  ╚██╔╝  ╚════██║\n██║     ██║  ██║╚██████╔╝   ██║   ███████║\n╚═╝     ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚══════╝")

let company = [
  ["Exotrails", "Secteur 1", "Une description", "assets/logo_exotrail_full.e32341e.png", "une.adresse@mail.com", "www.monsite.com"],
  ["SpaceDreams", "Secteur 1", "Une description", "assets/SpaceDreamslogo.webp", "une.adresse@mail.com", "www.monsite.com"],
  ["Venture", "Secteur 2", "Une description", "assets/VOS log.webp", "une.adress@mail.com", "www.monsite.com"],
  ["U_Space", "Secteur 3", "Une description", "assets/Uspacelogo.webp", "une.adresse@mail.com", "www.monsite.com"],
  ["Unseenlabs", "Secteur 4", "Une description", "assets/unseenlabslogo.svg", "une.adresse@mail.com", "www.monsite.com"],
  ["Share my space", "Secteur 5", "Une description", "assets/Share MSPlogo.webp", "une.adresse@mail.com", "www.monsite.com"],
  ["COMAT", "Secteur 2", "Une description", "assets/COMATlogo.webp", "une.adresse@mail.com", "www.monsite.com"]
];

let sectors = [
  ["Secteur 1", "planet2.png"],
  ["Secteur 2", "planet0.png"],
  ["Secteur 3", "planet1.png"],
  ["Secteur 4", "planet3.png"],
  ["Secteur 5", "planet4.png"]
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
canvas.width = window.innerWidth*0.999;
canvas.height = window.innerHeight*0.8;

let particles = [];

let stars = [];

let popups = [];

let grabbed = "";

let mouseMoved = false;

window.addEventListener('resize', function (e) {
  canvas.width = window.innerWidth*0.999;
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
  var done = false;
  if (grabbed != "") {
    grabbed = "";
    done = true;
  }

  for (var i = popups.length-1; i > -1; i--) {
    if (popups[i].hovered() && !done) {
      done = true;
      if (popups[i].closing()) {
        done = true;
        popups.splice(i, 1);
      }
    }
  }

  for (var i = 0; i < particles.length; i++) {
    if (particles[i].hovered() && !done) {
      done = true;
      var createNew = true;
      for (var j = 0; j < popups.length; j++) {
        if (popups[j].particle == particles[i]) {
          createNew = false;
          popups[j].x = popups[j].particle.x-popups[j].width/2;
          popups[j].y = popups[j].particle.y-popups[j].height/2;
        }
      }
      if (createNew) {
        popups.push(new Popup(particles[i].x, particles[i].y, particles[i]));
        popups[popups.length-1].x -= popups[popups.length-1].width/2;
        popups[popups.length-1].y -= popups[popups.length-1].height/2;
      }
    }
  }


  grabbed = "";
})

canvas.addEventListener('mousemove', function(e) {
  if (grabbed != "") {
    grabbed.x += e.x-mouse.x;
    grabbed.y += e.y-mouse.y;
  }

  mouse.x = e.x;
  mouse.y = e.y;
  for (var i = 0; i < particles.length; i++) {
    particles[i].size = particles[i].originSize;
    if (particles[i].hovered()) {
      particles[i].size = particles[i].increaseSize;
    }
  }
})

canvas.addEventListener('mousedown', function(e) {
  mouse.x = e.x;
  mouse.y = e.y;
  grabbed == "";
  for (var i = 0; i < popups.length; i++) {
    if (popups[i].hoverTopBar() && grabbed == "") {
      grabbed = popups[i];
      popups.splice(i, 1);
      popups.push(grabbed);
    }
  }
});

class Popup {
  constructor(x, y, particle) {
    this.x = x;
    this.y = y;
    this.particle = particle;
    this.lineWidth = particle.industry[4].length+4;
    this.width = this.lineWidth*8+32;
    this.lines = this.wrapText(particle.industry[2], this.lineWidth);
    this.height = this.lineWidth*8+48;
  }

  wrapText(text, maxWidth) {
    var words = text.split(' ');
    var currentLine = "";
    var finalLines = [];
    while (words.length > 0) {
      var tempLine = currentLine + " " + words[0];
      if (tempLine.length > maxWidth) {
        finalLines.push(currentLine);
        currentLine = "";
      }
      else {
        currentLine = currentLine + " " + words[0];
        words.splice(0, 1);
      }
    }
    if (currentLine.length != 0) {
      finalLines.push(currentLine)
    }
    return finalLines;
  }

  hovered() {
    if (mouse.x > this.x && mouse.x < this.x + this.width) {
      if (mouse.y > this.y && mouse.y < this.y + this.height) {
        return true;
      }
    }
    return false;
  }

  hoverTopBar() {
    if (mouse.x > this.x && mouse.x < this.x+this.width-16) {
      if (mouse.y > this.y && mouse.y < this.y+24) {
        return true;
      }
    }
    return false;
  }

  closing() {
    if (mouse.x > this.x+this.width-16 && mouse.x < this.x+this.width) {
      if (mouse.y > this.y && mouse.y < this.y+16) {
        return true;
      }
    }
    return false;
  }

  draw() {
    ctx.fillStyle = 'rgba(160, 160, 160, 0.9)';
    ctx.beginPath();
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = 'rgba(100, 100, 100, 1)';
    ctx.beginPath();
    ctx.fillRect(this.x, this.y, this.width, 20);
    ctx.fillStyle = 'rgb(255, 0, 0)';
    ctx.beginPath();
    ctx.fillText("X", this.x+this.width-16, this.y+16);
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.beginPath();
    ctx.fillText(this.particle.industry[0], this.x+(this.lineWidth/4)*16-(this.particle.industry[0].length/2-1)*8, this.y+16); //Why does it have to be THIS complicated to center text ?!?!
    for (var i = 0; i < this.lines.length; i++) {
      ctx.beginPath();
      ctx.fillText(this.lines[i], this.x+(this.lineWidth/4)*8-(this.lines[i].length/4)*4, this.y+32+(16*i));
    }
    ctx.fillStyle = 'rgb(0, 200, 255)';
    ctx.beginPath();
    ctx.fillText(this.particle.industry[4], this.x, this.y+this.height-32);
  }
}


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
    ctx.font = "16px Arial";
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,1)';
    ctx.fillText(this.industry[0], this.x-((this.industry[0].length + this.industry[0].length%2)*8)/2, this.y-this.size);
    // if (this.hovered()) {
      // var image = new Image();
      // image.src = this.industry[3];
      // ctx.drawImage(image, this.x-this.size, this.y-this.size, this.size*2, this.size*2);
    // }
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
    this.x = -40-this.size*3;
    this.y = Math.random() * (canvas.height-this.size*2)+(this.size*2);
    this.spd = Math.random() * 1.25+2;
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

  if (Date.now()/1000 - eventCounter.getTime()/1000 > 10) {
    eventCounter.setTime(Date.now());
    var eventType = Math.floor(Math.random() * 3)
    console.log(eventType);
    if (eventType != 2) {
      eventObjects.push(new Satellite(Math.floor(Math.random()*2)));
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


function handlePopups() {
  for (var i = 0; i < popups.length; i++) {
    popups[i].draw();
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
  handleStars();
  handleEvents();
  handleParticles();
  handlePopups();
  requestAnimationFrame(animate);
}

animate();
});
