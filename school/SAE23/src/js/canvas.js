$(document).ready( function () {

  //Parameters. The only word I can type "paramters"
  //If you see any spelling errors, please tell me.
  //I type to fast to notice them most of the time.

  const canvas = document.getElementById('mycanvas');
  const ctx = canvas.getContext('2d');
  let font = "18px sans-serif";
  let fontHeight = 18;
  ctx.font = font;
  ctx.save();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  fontHeight = Math.round(18 * (window.innerHeight/900));
  font = fontHeight.toString() + "px sans-serif";
  //This is normally inside of the resize function, but since the size of the window might not be the same when starting
  //We need to update the fontHeight right away at the start.


  const mouse = {
    x: undefined,
    y: undefined
  };

  const grabbingPoint = {
    x: undefined,
    y: undefined
  }

  const phpBlocks = [ //Block type 0
    ["PHP", "template"], //Entry point, doesn't translate to code
    ["getSessionId", "session_start();\n$idUser = NULL;\nif (isset($_SESSION['idUser'])) {\n$idUser = $_SESSION['idUser'];\n}\n"],
    ["getLoginFromPost", "$login = NULL;\n$pass = NULL;\nif (isset($_POST['login'])) {\n$login = $_POST['login'];\n}\nif (isset($_POST['pass'])) {\n $pass=$_POST['pass'];\n}\n"],
    ["openDB", "include_once('@dbConfigPath');\n$db = new mysqli(DB_HOST, DB_LOGIN, DB_PWD, DB_NAME);\n$db->set_charset('utf-8');\n", "dbConfigPath"],
    ["closeDB", "$db->close();\n"],
    ["checkLogin", `$login = $db->real_escape_string($login);

    if ($login != NULL) {
      $query = "SELECT * FROM @tblName WHERE BINARY login='$login';";
      $result = $db->query($query);
      $num_rows = $result->num_rows;
      $result->close();
      if ($num_rows != 1) {
        header('Location: @failure');
      } else {
        $hash = $row['password'];
        if (password_verify($pass, $hash)) {
          header('Location: @success');
        }
      }
    }`, "tblName","success", "failure"],
    ["validateSession", ""],
    ["endSession", "session_start();\nsession_unset();\nsession_destroy();\n"],
    ["redirect", "header('Location: @location');\n", "location"],
  ];

  const htmlBlocks = [ //Block type 1
    ["body", "template"], //Entry point, doesn't translate to code
    ["head", "template"],
    ["title", "<title>@name</title>\n", "name"],
    ["paragraph", "<p>@content</p>\n","content"],
    ["header", "<h1>@title</h1>\n", "title"],
    ["script", "<script>@script</script>\n", "script"],
    ["image", "<img src='@path'/>\n", "path"],
	  ["scriptFile", "<script type='text/javascript' src='@path'></script>\n", "path"],
    ["stylesheet", "<link rel='stylesheet' type='text/css' href='@path' media='screen' />\n", "path"]
  ];

  const cssBlocks = [ //Block type 2
	["CSS", "template"], //Entry point, doesn't translate to code

  ];

  const entryBlocks = [ //This is just a list of block names that act as entry points
    "head",
    "PHP",
    "body",
	  "CSS"
  ]


  function blockExists(name) {
    for (var i = 0; i < phpBlocks.length; i++) {
      if (phpBlocks[i][0] == name) return 0;
    }
    for (var i = 0; i < htmlBlocks.length; i++) {
      if (htmlBlocks[i][0] == name) return 1;
    }
    for (var i = 0; i < cssBlocks.length; i++) {
      if (cssBlocks[i][0] == name) return 2;
    }
    return -1;
  }

  class Block {
    constructor(x, y, name) {
      this.x = x;
      this.y = y;
      this.name = name;
      this.parameters = [];
      this.parameterValues = [];
      this.width = 0
      this.parameters = [];
      this.parameterWidth = [];
      this.height = fontHeight+5; //Just a bit biger than the fontHeight for looks
      this.nextBlock = "";
      this.previousBlock = "";
      this.phantom = false;
      this.entry = false;
      var blockType = blockExists(this.name); //Depending on the block type, lookup in a different array

      if (entryBlocks.indexOf(this.name) != -1) this.entry = true;

      if (blockType == 0) {
        for (var i = 0; i < phpBlocks.length; i++) {
          if (phpBlocks[i][0] == this.name) {
            for (var j = 2; j < phpBlocks[i].length; j++) {
              this.parameters.push(phpBlocks[i][j]);
            }
          }
        }
      }

      if (blockType == 1) {
        for (var i = 0; i < htmlBlocks.length; i++) {
          if (htmlBlocks[i][0] == this.name) {
            for (var j = 2; j < htmlBlocks[i].length; j++) {
              this.parameters.push(htmlBlocks[i][j]);
            }
          }
        }
      }

      if (blockType == 2) {
        for (var i = 0; i < cssBlocks.length; i++) {
          if (cssBlocks[i][0] == this.name) {
            for (var j = 2; j < cssBlocks[i].length; j++) {
              this.parameters.push(cssBlocks[i][j]);
            }
          }
        }
      }

      for (var i = 0; i < this.parameters.length; i += 1) {
        this.parameterValues.push(""); //Push in the default stuff (cuz we just created the block)
        this.parameterWidth.push(0);
      }
    }

    isChild(block) {
      if (this.nextBlock == block) return true;
      else if (this.nextBlock == "") return false;
      else return this.nextBlock.isChild(block);
    }

    update() {
      if (this.nextBlock != "") {
        this.nextBlock.x = this.x;
        this.nextBlock.y = this.y + this.height;
        this.nextBlock.realX = this.nextBlock.x;
        this.nextBlock.realY = this.nextBlock.y;
        this.nextBlock.phantom = this.phantom;
        this.nextBlock.update() //We force update all the blocks underneath this one.
      }
    }

    /*
      We have to calculate the width since the parameters can cause it to change
      Not only that, but the font width can change too.
    */

    calculateWidth() {
      this.height = fontHeight + 5;
      ctx.font = font;
      this.width = ctx.measureText(this.name).width + 6; // We have to measure the text's width
      for (var i = 0; i < this.parameters.length; i++) {
        if (this.parameterValues[i] == "") { //We adjust ourselves based on wether a parameter as it's default value or not
          this.parameterWidth[i] = ctx.measureText(this.parameters[i]).width;
          this.width += this.parameterWidth[i] + 6;
        } else {
          this.parameterWidth[i] = Math.max(30, ctx.measureText(this.parameterValues[i]).width);
          this.width += this.parameterWidth[i] + 6;
        }
      }
    }

    updateParameter(parameter, value) { // update a parameter based on index
      if (parameter < 0 || parameter > this.parameters.length) {
        return false;
      } else {
        this.parameterValues[parameter] = value;
        return true;
      }
    }

    getCode() { //Give us the block in an array
      var code = -1;
      var type = blockExists(this.name);
      if (type == 0) {
        for (var i = 0; i < phpBlocks.length; i++) {
          if (phpBlocks[i][0] == this.name) {
            code = $.extend(true, [], phpBlocks[i]);
            }
          }
        }
      if (type == 1) {
        for (var i = 0; i < htmlBlocks.length; i++) {
          if (htmlBlocks[i][0] == this.name) {
            code = $.extend(true, [],htmlBlocks[i]);
          }
        }
      }
      if (type == 2) {
        for (var i = 0; i < cssBlocks.length; i++) {
          if (cssBlocks[i][0] == 2) {
            code = $.extend(true, [], cssBlocks[i]);
          }
        }
      }

      //Fun fact : I originally did not do this. This method requires hardcoding the blocks and adding small parameters.
      if (code != -1) {
        var translatedCode = code[1];
        for (var i = 2; i < code.length; i++) {
          translatedCode = translatedCode.replaceAll('@'+code[i], this.parameterValues[i-2]);
        }
        code[1] = translatedCode;
      }
      return code //Return -1 if the block isn't defined
    }

    hoverBody() { //detect if mouse over body
      this.calculateWidth();
      if (mouse.x < this.x) return false;
      if (mouse.x > this.x + this.width) return false;
      if (mouse.y < this.y) return false;
      if (mouse.y > this.y + this.height) return false;
      return true;
    }

    hoverParam() { //detect if mouse over parameter box
      this.calculateWidth();
      ctx.font = font;
      var currentX = ctx.measureText(this.name).width + 6;
      var ok = true;
      if (!this.hoverBody()) return -1 //We are not over the block
      for (var i = 0; i < this.parameters.length; i++) {
        ok = true;
        if (mouse.x < this.x + currentX) ok = false;
        if (mouse.x > this.x + currentX + this.parameterWidth[i]) ok = false;
        if (ok) {
          return i; //The mouse is on this parameter.
        }
        currentX += this.parameterWidth[i] + 4;
      }

      return -1; // Mouse isn't over any parameters
    }

    draw() { //Ultra complex drawing function (not really)
      this.calculateWidth();

      var blockType = blockExists(this.name);
      var alpha = "1";
      if (this.phantom) alpha = "0.25";

      if (blockType != -1) {
        ctx.font = font;
        if (blockType == 0)
          ctx.fillStyle = 'rgba(180, 40, 40, '+alpha+')'; //Draw the body
        if (blockType == 1)
          ctx.fillStyle = 'rgba(40, 40, 180, '+alpha+')';
        if (blockType == 2)
          ctx.fillStyle = 'rgba(180, 40, 180, '+alpha+')';

        if (this.entry) { //Draw the side triangles
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x-5, this.y);
          ctx.lineTo(this.x, this.y+this.height);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(this.x+this.width, this.y);
          ctx.lineTo(this.x+this.width+5, this.y);
          ctx.lineTo(this.x+this.width, this.y+this.height);
          ctx.closePath();
          ctx.fill();
        }



        ctx.beginPath();
        ctx.fillRect(this.x, this.y, this.width, this.height);
        if (this.previousBlock != "") { // Draw a little notch when connected to another block
          var previousBlockType = blockExists(this.previousBlock.name);
          ctx.beginPath();
          if (previousBlockType == 0)
            ctx.fillStyle = 'rgba(180, 40, 40, '+alpha+')'; //Draw the body
          if (previousBlockType == 1)
            ctx.fillStyle = 'rgba(40, 40, 180, '+alpha+')';
          if (previousBlockType == 2)
            ctx.fillStyle = 'rgba(180, 40, 180, '+alpha+')';
          ctx.strokeStyle = 'rgb(0, 0, 0)';
          ctx.moveTo(this.x+2, this.y);
          ctx.lineTo(this.x+4, this.y+3);
          ctx.lineTo(this.x+8, this.y+3);
          ctx.lineTo(this.x+10, this.y);
          ctx.stroke();
          ctx.closePath();
          ctx.fill();
          

        }
        ctx.fillStyle = 'rgb(255, 255, 255)'; //Name of the block
        ctx.fillText(this.name, this.x+2, this.y+fontHeight)
        var currentX = ctx.measureText(this.name).width + 6;

        for (var i = 0; i < this.parameters.length; i++) { // Draw the parameters
          ctx.fillStyle = 'rgb(255, 255, 255)';
          ctx.beginPath();
          ctx.fillRect(this.x + currentX, this.y+1, this.parameterWidth[i], this.height-1);
          if (this.selected == i)
          ctx.strokeStyle = 'green';
          else
          ctx.strokeStyle = 'black'; //White box container
          ctx.beginPath();
          ctx.rect(this.x + currentX, this.y, this.parameterWidth[i], this.height); //black border for the container
          ctx.stroke();

          ctx.fillStyle = 'rgb(0, 0, 0)';
          if (this.parameterValues[i] == "") { //Parameter value
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillText(this.parameters[i], this.x + currentX, this.y + fontHeight);
          }
          else
            ctx.fillText(this.parameterValues[i], this.x + currentX, this.y + fontHeight);
          currentX += this.parameterWidth[i] + 4;
        }
      }
    }
  }

  class Button {
    constructor(value, x, y, width, height, func) {
      this.value = value;
      this.x = x;
      this.y = y;
      this.realX = x;
      this.realY = y;
      this.width = width;
      this.height = height;
      this.clicked = false;
      this.func = func;
    }


    calculateWidth() {
      this.height = fontHeight+4;
      ctx.font = font;
      this.width = ctx.measureText(this.value).width + 4;
    }

    draw() {
      this.calculateWidth();
      ctx.font = font;
      ctx.fillStyle = 'rgba(120, 120, 120, 1)';
      ctx.beginPath();
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.stroke();
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.beginPath();
      ctx.fillText(this.value, this.x+this.width/2 - ctx.measureText(this.value).width/2, this.y + this.height - fontHeight/4); // maths = cool looking stuff
    }

    hover() {
      this.calculateWidth();
      if (mouse.x < this.x) return false;
      if (mouse.x > this.x + this.width) return false;
      if (mouse.y < this.y) return false;
      if (mouse.y > this.y + this.height) return false;
      return true;
    }
  }

  class Toolbox {
    constructor(name, blockType) {
      this.hidden = true;
      this.closed = true;
      this.realX = 0;
      this.realY = 0;
      this.name = name;
      this.blockType = blockType;
      ctx.font = font;
      this.toggle = new Button(name, 0, 0, ctx.measureText(name).width+2, fontHeight+2)
      this.content = []
      this.x = 0;
      this.y = 0;
      /*Generate the content of the toolbox based on its type.
      This can be modified later on in the code, and blockType -1 is user-defined.
      For now it's not possible to create custom blocks, but a toolbox with stuff often used could be made by the user
      */
      if (blockType == 0) {
        for (var i = 0; i < phpBlocks.length; i++) {
          this.content.push(new Block(0, 0, phpBlocks[i][0]));
        }
      }
      if (blockType == 1) {
        for (var i = 0; i < htmlBlocks.length; i++) {
          this.content.push(new Block(0, 0, htmlBlocks[i][0]));
        }
      }
      if (blockType == 2) {
        for (var i = 0; i < cssBlocks.length; i++) {
          this.content.push(new Block(0, 0, cssBlocks[i][0]));
        }
      }
    }

    update() { // This has to be called at least once before drawing
      //This updates the position of the blocks based on where the toolbox is
      this.toggle.x = this.x;
      this.toggle.y = this.y;
      for (var i = 0; i < this.content.length; i++) {
        this.content[i].x = this.x + 10;
        this.content[i].y = this.y + this.toggle.height + 8 + (fontHeight+8)*i;
      }

    }

    draw() {
      this.update();
      if (!this.hidden) {
        this.toggle.draw();
        if (!this.closed) {
          ctx.font = font;
          ctx.strokeStyle = 'rgb(0, 0, 0)';
          ctx.beginPath();
          ctx.moveTo(this.x, this.y+20);
          ctx.lineTo(this.x, this.y + this.content[this.content.length-1].y+this.content[this.content.length-1].height);
          ctx.stroke();
          for (var i = 0; i < this.content.length; i++) {
            this.content[i].draw();
          }
        }
      }
    }
  }


  //Stuff used by event listeners.
  let grabbed = "";
  let editing = "";
  let editParam = -1;

  /*
    I hate having to use event listeners in classes (it makes a mess since stuff needs to be shared between them)
    This is why I used "global" variables for the event listeners. It's ugly, but a lot easier for me
  */

  let pageContent = [
  ];

  let toolboxes = [

  ];

  let buttons = [

  ];
  let fileName = "";

  /*
    Event listeners to do stuff (move a block, edit a param, etc.)
    we don't have mouseup since click and mouseup do the same thing here.
  */

  let oldX = 0; //These two variables are used by toolboxes
  let oldY = 0;
  canvas.addEventListener('click', function (e) { //Big boy function... for an event. yay.
    mouse.x = e.x;
    mouse.y = e.y;

    editing = "";
    editParam = -1;

    if (grabbed == "") {  //Parameter editing
      for (var i = 0; i < pageContent.length; i++) {

        if (pageContent[i].hoverBody()) {
          if (pageContent[i].hoverParam() > -1) {
            editing = pageContent[i];
            editParam = pageContent[i].hoverParam();
            editing.selected = editParam;
            break;
          }
        }
      }

      for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].hover()) { //Execute the function linked to the button
          buttons[i].func();
          break;
        }
      }

      var toolboxesProcessed = false;
      for (var i = 0; i < toolboxes.length; i++) {
        //first check if any toolboxes are open, in which case we only care about this one
        if (!toolboxes[i].closed && toolboxes[i].toggle.hover()) {
          toolboxes[i].closed = true;
          toolboxes[i].y = oldY; //move the toolbox back to it's old location
          toolboxesProcessed = true;
        }
      }
      if (!toolboxesProcessed) { //If we didn't have an open toolbox, we check if we opened one
        for (var i = 0; i < toolboxes.length; i++) {
          if (!toolboxes[i].hidden && toolboxes[i].toggle.hover()) {
            toolboxes[i].closed = false;
            oldY = toolboxes[i].y;
            toolboxes[i].y = 20;
          }
        }
      }
    }
    else if (grabbed != "") { // if we grabbed something, ungrab it.
      //In the case we had a phantom block (and therefore had a block underneath)
      for (var i = 0; i < pageContent.length; i++) {
        if (pageContent[i] != grabbed && !grabbed.entry) {
          console.log(grabbed.entry);
          if (pageContent[i].hoverBody() && pageContent[i].nextBlock == "") {
            pageContent[i].nextBlock = grabbed;
            grabbed.previousBlock = pageContent[i];
            grabbed.phantom = false;
          }
        }
      }
      if (mouse.x < 400 && buttons[0].value == "<") { //Delete this block and its children
        var currentBlock = grabbed;
        while(currentBlock != "") {
          pageContent.splice(pageContent.indexOf(currentBlock), 1);
          currentBlock.previousBlock = "";
          currentBlock = currentBlock.nextBlock;
        }
      }
      grabbed = "";
    }
  });

  canvas.addEventListener('mousedown', function(e) { //grab blocks, and create duplicates
    mouse.x = e.x;
    mouse.y = e.y;

    if (grabbed == "") {
      //Create duplicates first
      for (var i = 0; i < toolboxes.length; i++) {
        if (!toolboxes[i].closed) {
          var toolbox = toolboxes[i];
          for (var j = 0; j < toolbox.content.length; j++) {
            if (toolbox.content[j].hoverBody()) {
              var canCreate = true;
              if (toolbox.content[j].entry) {
                for (var k = 0; k < pageContent.length; k++) {
                  if (pageContent[k].name == toolbox.content[j].name) {
                    canCreate = false;
                    break;
                  }
                }
              }
              if (canCreate)
                pageContent.push(new Block(toolbox.content[j].x, toolbox.content[j].y, toolbox.content[j].name));
            }
          }
        }
      }
      //THEN detect if we have a block to grab
      for (var i = 0; i < pageContent.length; i++) {
        pageContent[i].selected = -1;
        if (pageContent[i].hoverBody() && pageContent[i].hoverParam() == -1) {
          grabbed = pageContent[i];
          grabbingPoint.x = mouse.x - grabbed.x; //move the block from the grabbing point
          grabbingPoint.y = mouse.y - grabbed.y;
          grabbed.previousBlock.nextBlock = "";
          grabbed.previousBlock = "";
          break;
        }
      }
    }
  });

  canvas.addEventListener('mousemove', function (e) {
    mouse.x = e.x
    mouse.y = e.y;

    if (grabbed != "") {
      grabbed.x = mouse.x - grabbingPoint.x;
      grabbed.y = mouse.y - grabbingPoint.y;
      grabbed.realX = grabbed.x;
      grabbed.realY = grabbed.y;
      grabbed.phantom = false;
      //Check if we are above another block.
      //If so, plop down a "phantom" of the grabbed blok at the corresponding location
      //Unless we have an entry block (such as the HTML body)
      for (var i = 0; i < pageContent.length; i++) {
        if (pageContent[i] != grabbed && !grabbed.isChild(pageContent[i]) && !grabbed.entry) {
          if (pageContent[i].hoverBody() && pageContent[i].nextBlock == "") {
            grabbed.x = pageContent[i].x;
            grabbed.y = pageContent[i].y + pageContent[i].height;
            grabbed.phantom = true;
            break;
          }
        }
      }

      if (mouse.x < 310 && buttons[0].value == "<") {
        grabbed.phantom = true;
      }
    }
  });


  window.onkeydown = function(e) { //Stuff to modify parameters
    if (editing != "" && editParam != -1) {
      value = editing.parameterValues[editParam];
      if (e.which == 8 && value.length > 0) {
        value = value.slice(0, -1);
      } else if (e.which == 13) {
        editing.selected = -1;
        console.log(editing.getCode());
        editing = "";
        editParam = -1;
      } else if (e.which >= 32) {
        value += e.key;
      } else {
        console.log(e.which);
      }
      if (editing != "")
        editing.parameterValues[editParam] = value;
    }
  }

  function handleBlocks() {
    for (var i = 0; i < pageContent.length; i++) {
      pageContent[i].update();
      pageContent[i].draw();
    }
  }

  function handleButtons() {
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].draw();
    }
  }

  function handleToolboxes() {

    //Add a bit of extra rendering when we show the toolboxes
    if (buttons[0].value == "<") {
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.moveTo(408,0);
      ctx.lineTo(408, canvas.height);
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, 408, canvas.height);
    }

    //check if any toolboxes is open
    for (var i = 0; i < toolboxes.length; i++) {
      if (!toolboxes[i].closed) {
        toolboxes[i].draw();
        return;
      }
    }

    //if none are open, draw all of them
    for (var i = 0; i < toolboxes.length; i++) {
      toolboxes[i].draw();
    }
  }


  function toggleToolboxes() {
    for (var i = 0; i < toolboxes.length; i++) {
      toolboxes[i].hidden = !toolboxes[i].hidden;
    }
    if (buttons[0].x == 0) {
      buttons[0].x = 400;
      buttons[0].value = "<";
    }
    else {
      buttons[0].x = 0;
      buttons[0].value = ">";
    }
  }

  function drawGrid() {
    for (var i = 0; i < canvas.width; i+= 40) {
      for (var j = 0; j < canvas.height; j += 40) {
        ctx.strokeStyle = 'lightgrey';
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }
    }
  }

  window.addEventListener('resize', function (e) { // in the events the canvas gets resized.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    fontHeight = Math.round(18 * (window.innerHeight/900));
    font = fontHeight.toString() + "px sans-serif";
    console.log(font);
    ctx.font = font;
    ctx.save();
    //Move everything and resize everyhing according to the new scale
    for (var i = 0; i < pageContent.length; i++) {
      var block = pageContent[i];
      block.x = Math.round(block.x * (window.innerWidth/1800));
      block.y = Math.round(block.y * (window.innerHeight/900));
    }

    buttons[0].y = canvas.height/2-fontHeight;
    buttons[1].x = canvas.width/2-(30*window.innerWidth/1800);
    buttons[2].x = canvas.width/2-(90*window.innerWidth/1800);
    buttons[3].x = canvas.width/2+(60*window.innerWidth/1800);
  });



  buttons.push(new Button(">", 0, canvas.height/2-fontHeight, 16, fontHeight, toggleToolboxes));

  //Create toolboxes
  toolboxes.push(new Toolbox("PHP", 0));
  toolboxes.push(new Toolbox("HTML", 1));
  toolboxes[0].x = 20;
  toolboxes[0].y = 20;
  toolboxes[1].x = 20;
  toolboxes[1].y = 60;

  document.onkeydown = function (e) {
    return false;
  }

  function animate() { //TODO ? : add proper animations (closing/opening a toolbox, moving stuff, maybe an object that periodically appears)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawGrid();
    handleToolboxes();
    handleButtons();
    handleBlocks();
    requestAnimationFrame(animate);
  }



  //Functions to create save files and the final result
  function createBlob(data) {
    return new Blob([data], {type: "text/plain"});
  }

  function saveAs(content, fileName) {
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(content);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function saveProject() {
    var phpBlockList = [];
    var headBlockList = [];
    var bodyBlockList = [];
    var result = "";
    for (var i = 0; i < pageContent.length; i++) {
      if (entryBlocks.indexOf(pageContent[i].name) > -1) {
        result += pageContent[i].name + "\n";
        var currentBlock = pageContent[i].nextBlock;
        while (currentBlock != "") {
          result += currentBlock.name + "\n";
          for (var j = 0; j < currentBlock.parameters.length; j++) {
            result += currentBlock.parameterValues[j] + "\n";
          }
          currentBlock = currentBlock.nextBlock;
        }
      }
    }

    saveAs(createBlob(result), "page.proj");
  }


  function getFile() {
      const fileInput = document.getElementById('file');
      fileInput.click();
  }

  async function loadFile(file) {
    let text = await file.text();
    console.log(text);
    text = text.split('\n');
    var currentBlock = "";
    pageContent = [];
    for (var i = 0; i < text.length; i++) {
      if (blockExists(text[i]) > -1) {
        if (entryBlocks.indexOf(text[i]) > -1) {
          pageContent.push(new Block(0, 0, text[i]));
          currentBlock = pageContent[pageContent.length-1];
        }
        else if (currentBlock != "") {
          pageContent.push(new Block(0, 0, text[i]));
          currentBlock.nextBlock = pageContent[pageContent.length-1];
          currentBlock.nextBlock.previousBlock = currentBlock;
          currentBlock = currentBlock.nextBlock;
          for (var j = 0; j < currentBlock.parameters.length; j++) {
            
            if (i+j < text.length) {
              currentBlock.parameterValues[j] = text[i+(j+1)];
            }
          }
          i + currentBlock.parameters.length; //evil hack
        }
      }
    }
    console.log(text);
    console.log(pageContent);
  }

  const fileInput = document.getElementById('file');
  fileInput.onchange = function () {
    loadFile(fileInput.files[0]);
  };

  /*
    COMPILATION TIME !!!
  */
  function compile() {
    //First step : sort out the various blocks and only grab the entry points one (PHP head, HTML head, body)
    var headBlock = "";
    var phpBlock = "";
    var bodyBlock = "";
    var cssBlock = "";
    var title = "page"
    //Since blocks have a link to the blocks underneath them, we only need the first block of each section.
    //We need at least one entry point.
    //WARNING : if multiple entry points exist for one location (i.e two body blocks), this will only grab the first one created.
    //This shouldn't happen, but people will be people and find some way to do it.

    for (var i = 0; i < pageContent.length; i++) {
      if (pageContent[i].name == "head" && headBlock == "") {
        headBlock = pageContent[i];
      }
      if (pageContent[i].name == "PHP" && phpBlock == "") {
        phpBlock = pageContent[i];
      }
      if (pageContent[i].name == "body" && bodyBlock == "") {
        bodyBlock = pageContent[i];
      }
    }

    //next step : generate the code blocks

    var phpCode = ""; //Only contains PHP. Is placed at the top of the file
    var headCode = ""; //Only contains HTML. Is placted after PHPCodeBlock
    var cssCode = ""; //WIP. Placed in the headCode before it closes
    var bodyCode = ""; //Contains both HTML and PHP. Placed after headCodeBlock

    if (phpBlock != "") {
      phpCode += "<?php\n";

      var currentBlock = phpBlock.nextBlock;
      while (currentBlock != "") {
        if (blockExists(currentBlock.name) == 0) {
          phpCode += currentBlock.getCode()[1];
          currentBlock = currentBlock.nextBlock;
        } else currentBlock = currentBlock.nextBlock;
      }

      phpCode += "?>\n"
    }

    if (headBlock != "") {
      headCode += "<html>\n<head>\n";

      var currentBlock = headBlock.nextBlock;
      while (currentBlock != "") {
        if (blockExists(currentBlock.name) == 1) {
          headCode += currentBlock.getCode()[1];
          if (currentBlock.name == "title") {
            title = currentBlock.parameterValues[0];
          }
          currentBlock = currentBlock.nextBlock;
        } else currentBlock = currentBlock.nextBlock;
      }


      headCode += "</head>\n";
      if (bodyBlock == "" && cssBlock == "") {
        headCode += "</html>\n";
      }
    }

    if (cssBlock != "" && headBlock != "") {
      cssCode += "<style>\n";
      var currentBlock = cssBlock.nextBlock;
      while (currentBlock != "") {

      }
      cssCode += "</style>\n</head>\n";
    }

  if (bodyBlock != "") {
    if (headBlock == "") {
      bodyCode += "<html>\n";
    }

    bodyCode += "<body>\n";
    var currentBlock = bodyBlock.nextBlock;
    var lastType = 1;
    while (currentBlock != "") {
      var currentType = blockExists(currentBlock.name); // The only type of block we can't accept here is CSS
      if (currentType == 0 || currentType == 1) {
        if (lastType == 0 && currentType == 1) {
          bodyCode += "?>\n";
        }
        else if (lastType == 1 && currentType == 0) {
          bodyCode += "<?php\n";
        }
        lastType = currentType;
        bodyCode += currentBlock.getCode()[1];
        currentBlock = currentBlock.nextBlock;
      } else currentBlock = currentblock.nextBlock;
    }

    bodyCode += "</body>\n</html>\n";
  }

  var resultExtension = ".";
  if (phpBlock == "") resultExtension += "html";
  else resultExtension += "php";

  var result = phpCode += headCode += bodyCode;
  result = createBlob(result);
  saveAs(result, title + resultExtension);
}




  buttons.push(new Button("compile", canvas.width/2-30, 0, 70, fontHeight, compile));
  buttons.push(new Button("load", canvas.width/2-90, 0, 70, fontHeight, getFile));
  buttons.push(new Button("save", canvas.width/2+60, 0, 70, fontHeight, saveProject));

  animate();



});
