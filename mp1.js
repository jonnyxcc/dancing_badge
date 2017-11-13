
var gl;
var canvas;
var shaderProgram;
var vertexPositionBuffer;

// Create a place to store vertex colors
var vertexColorBuffer;

var mvMatrix = mat4.create();
var rotAngle = 0;
var lastTime = 0;

var x = 0;


/*
  function convert:
  input: num
  output: a ratio, scaled for current canvas size (350)

  This function will scale a pixel address from 0-350 and output it as a ratio from 0-1 for use in WebGL
  to make a near pixel perfect image
*/
function convert(num)
{
  if (num > 175)
    num - 175;
  return (num-175)/175;
}

/*
  function setMatrixUniforms:
  input: none
  output: none

  Sets up the tranformation matrix shader for use in WebGL
*/
function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

/*
    function degtoRad:
    input: degrees
    output: radians

    Takes an input in degrees and converts it to radians
*/
function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

/*
    function create GL context:
    input: canvas
    output: context

    Creates a GL context out of the provided canvas
*/
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}

/*
    function setupShaders:
    input: id
    output: shader

    Create a shader for use in WebGL
*/
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);
  
  // If we don't find an element with the specified id
  // we do an early exit 
  if (!shaderScript) {
    return null;
  }
  
  // Loop through the children for the found DOM element and
  // build up the shader source code as a string
  var shaderSource = "";
  var currentChild = shaderScript.firstChild;
  while (currentChild) {
    if (currentChild.nodeType == 3) { // 3 corresponds to TEXT_NODE
      shaderSource += currentChild.textContent;
    }
    currentChild = currentChild.nextSibling;
  }
 
  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }
 
  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);
 
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  } 
  return shader;
}

/*
    function setupShaders:
    input: none
    output: none

    Setup the shaders with the proper colors for use in WebGL
*/
function setupShaders() {
  var vertexShader = loadShaderFromDOM("shader-vs");
  var fragmentShader = loadShaderFromDOM("shader-fs");
  
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  gl.useProgram(shaderProgram);
  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  
}

/*
    function setupBuffers:
    input: none
    output: none

    Setup the badge with the proper colors for use in WebGL
*/
function setupBuffers() {
  //setup mesh
  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  var triangleVertices = [ // this is the image of the Illinois badge

        // blue I

        // top rectangle of the badge
        convert(17), -convert(7),  0.0,
        convert(17), -convert(62),  0.0,
        convert(49), -convert(7),  0.0,

        convert(17), -convert(62), 0.0,
        convert(49), -convert(62), 0.0,
        convert(49), -convert(7), 0.0,

        convert(49), -convert(7), 0.0,
        convert(49), -convert(62), 0.0,
        convert(117), -convert(62), 0.0,

        convert(49), -convert(7), 0.0,
        convert(117), -convert(7), 0.0,
        convert(117), -convert(62), 0.0,

        convert(117), -convert(7), 0.0,
        convert(231), -convert(7), 0.0,
        convert(117), -convert(62), 0.0,

        convert(117), -convert(62), 0.0,
        convert(231), -convert(7), 0.0,
        convert(231), -convert(62), 0.0,

        convert(231), -convert(7), 0.0,
        convert(299), -convert(7), 0.0,
        convert(299), -convert(62), 0.0,

        convert(231), -convert(62), 0.0,
        convert(231), -convert(7), 0.0,
        convert(299), -convert(62), 0.0,

        convert(299), -convert(7), 0.0,
        convert(331), -convert(7), 0.0,
        convert(299), -convert(62), 0.0,

        convert(299), -convert(62), 0.0,
        convert(331), -convert(7), 0.0,
        convert(331), -convert(62), 0.0,

        // left lower part of the blue badge
        convert(49), -convert(62), 0.0,
        convert(117), -convert(62), 0.0,
        convert(117), -convert(107), 0.0,

        convert(49), -convert(62), 0.0,
        convert(49), -convert(107), 0.0,
        convert(117), -convert(107), 0.0,

        convert(49), -convert(107), 0.0,
        convert(49), -convert(183), 0.0,
        convert(117), -convert(107), 0.0,

        convert(117), -convert(107), 0.0,
        convert(49), -convert(183), 0.0,
        convert(117), -convert(183), 0.0,

        convert(49), -convert(183), 0.0,
        convert(49), -convert(227), 0.0,
        convert(117), -convert(183), 0.0,

        convert(49), -convert(227), 0.0,
        convert(117), -convert(183), 0.0,
        convert(117), -convert(227), 0.0,

        convert(117), -convert(107), 0.0,
        convert(142), -convert(107), 0.0,
        convert(117), -convert(183), 0.0,

        convert(142), -convert(107), 0.0,
        convert(117), -convert(183), 0.0,
        convert(142), -convert(183), 0.0,

        // right part of the blue badge
        convert(231), -convert(62), 0.0,
        convert(231), -convert(107), 0.0,
        convert(299), -convert(62), 0.0,

        convert(231), -convert(107), 0.0,
        convert(299), -convert(62), 0.0,
        convert(299), -convert(107), 0.0,

        convert(231), -convert(107), 0.0,
        convert(206), -convert(107), 0.0,
        convert(206), -convert(183), 0.0,

        convert(206), -convert(183), 0.0,
        convert(231), -convert(107), 0.0,
        convert(231), -convert(183), 0.0,

        convert(231), -convert(107), 0.0,
        convert(299), -convert(107), 0.0,
        convert(231), -convert(183), 0.0,

        convert(299), -convert(107), 0.0,
        convert(299), -convert(183), 0.0,
        convert(231), -convert(183), 0.0,

        convert(231), -convert(183), 0.0,
        convert(299), -convert(183), 0.0,
        convert(231), -convert(227), 0.0,

        convert(299), -convert(183), 0.0,
        convert(231), -convert(227), 0.0,
        convert(299), -convert(227), 0.0,


        // orange rectangles

        //left most rectangle
        convert(49), -convert(239), 0.0,
        convert(49), -convert(262), 0.0,
        convert(71), -convert(239), 0.0,

        convert(49), -convert(262), 0.0,
        convert(71), -convert(239), 0.0,
        convert(71), -convert(262), 0.0,

        convert(49), -convert(262), 0.0,
        convert(71), -convert(262), 0.0,
        convert(71), -convert(276), 0.0,

        // second rectangle on the left
        convert(95), -convert(239), 0.0,
        convert(117), -convert(239), 0.0,
        convert(95), -convert(290), 0.0,

        convert(95), -convert(290), 0.0,
        convert(117), -convert(290), 0.0,
        convert(117), -convert(239), 0.0,

        convert(95), -convert(290), 0.0,
        convert(117), -convert(290), 0.0,
        convert(117), -convert(305), 0.0,

        // left middle rectangle
        convert(141), -convert(239), 0.0,
        convert(163), -convert(239), 0.0,
        convert(141), -convert(319), 0.0,

        convert(141), -convert(319), 0.0,
        convert(163), -convert(239), 0.0,
        convert(163), -convert(319), 0.0,

        convert(141), -convert(319), 0.0,
        convert(163), -convert(319), 0.0,
        convert(163), -convert(333), 0.0,

        // right middle rectangle
        convert(186), -convert(239), 0.0,
        convert(208), -convert(239), 0.0,
        convert(186), -convert(319), 0.0,

        convert(186), -convert(319), 0.0,
        convert(208), -convert(319), 0.0,
        convert(208), -convert(239), 0.0,

        convert(186), -convert(333), 0.0,
        convert(208), -convert(319), 0.0,
        convert(186), -convert(319), 0.0,

        // second rectangle from the right
        convert(231), -convert(239), 0.0,
        convert(231), -convert(290), 0.0,
        convert(253), -convert(290), 0.0,

        convert(253), -convert(239), 0.0,
        convert(231), -convert(239), 0.0,
        convert(253), -convert(290), 0.0,

        convert(231), -convert(305), 0.0,
        convert(231), -convert(290), 0.0,
        convert(253), -convert(290), 0.0,

        // right most rectangle
        convert(277), -convert(239), 0.0,
        convert(299), -convert(262), 0.0,
        convert(299), -convert(239), 0.0,

        convert(277), -convert(239), 0.0,
        convert(277), -convert(262), 0.0,
        convert(299), -convert(262), 0.0,

        convert(277), -convert(262), 0.0,
        convert(277), -convert(276), 0.0,
        convert(299), -convert(262), 0.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
  vertexPositionBuffer.itemSize = 3;
  vertexPositionBuffer.numberOfItems = 132; //total items included
    
    //setup colors
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  var colors = [ //colors used, only RGB included

        // RGB value for the blue part of the badge
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,
        0.07, 0.16, 0.29,

        // RGB value for the orange part of the badge
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,

        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,

        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,

        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,

        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,

        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,

        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,

        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,

        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,

        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,

        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,

        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,

        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,

        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,

        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,

        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,

        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,

        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22,
        0.91, 0.29, 0.22
    ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 3;
  vertexColorBuffer.numItems = 132;  //total items included

}

/*
    function create GL context:
    input: none
    output: none

    Draw the mesh and colors on the canvas in WebGL
*/
function draw() { 
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight); //viewing angle static
  gl.clear(gl.COLOR_BUFFER_BIT);
  mat4.identity(mvMatrix);
  mat4.rotateY(mvMatrix, mvMatrix, degToRad(rotAngle)); //rotate along the Y axis
  mat4.rotateX(mvMatrix, mvMatrix, degToRad(rotAngle)); //rotate along the X axis
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0); //draw the mesh
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
                            vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0); //color the mesh
                          
  setMatrixUniforms();
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);
}

/*
    function animate:
    input: none
    output: none

    Change the rotation angle along each time interval
*/
function animate() {
  var timeNow = new Date().getTime(); 
  if (lastTime != 0) {
    var elapsed = timeNow - lastTime;
    rotAngle = (rotAngle + 1.0) % 360
  }
  lastTime = timeNow;

  x += .1;
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  var triangleVertices = [ // this is the image of the Illinois badge

        // blue I

        // top rectangle of the badge
        convert(17), -convert(7),  0.0,
        convert(17), -convert(62),  0.0,
        convert(49), -convert(7),  0.0,

        convert(17), -convert(62), 0.0,
        convert(49), -convert(62), 0.0,
        convert(49), -convert(7), 0.0,

        convert(49), -convert(7), 0.0,
        convert(49), -convert(62), 0.0,
        convert(117), -convert(62), 0.0,

        convert(49), -convert(7), 0.0,
        convert(117), -convert(7), 0.0,
        convert(117), -convert(62), 0.0,

        convert(117), -convert(7), 0.0,
        convert(231), -convert(7), 0.0,
        convert(117), -convert(62), 0.0,

        convert(117), -convert(62), 0.0,
        convert(231), -convert(7), 0.0,
        convert(231), -convert(62), 0.0,

        convert(231), -convert(7), 0.0,
        convert(299), -convert(7), 0.0,
        convert(299), -convert(62), 0.0,

        convert(231), -convert(62), 0.0,
        convert(231), -convert(7), 0.0,
        convert(299), -convert(62), 0.0,

        convert(299), -convert(7), 0.0,
        convert(331), -convert(7), 0.0,
        convert(299), -convert(62), 0.0,

        convert(299), -convert(62), 0.0,
        convert(331), -convert(7), 0.0,
        convert(331), -convert(62), 0.0,

        // left lower part of the blue badge
        convert(49), -convert(62), 0.0,
        convert(117), -convert(62), 0.0,
        convert(117), -convert(107), 0.0,

        convert(49), -convert(62), 0.0,
        convert(49), -convert(107), 0.0,
        convert(117), -convert(107), 0.0,

        convert(49), -convert(107), 0.0,
        convert(49), -convert(183), 0.0,
        convert(117), -convert(107), 0.0,

        convert(117), -convert(107), 0.0,
        convert(49), -convert(183), 0.0,
        convert(117), -convert(183), 0.0,

        convert(49), -convert(183), 0.0,
        convert(49), -convert(227), 0.0,
        convert(117), -convert(183), 0.0,

        convert(49), -convert(227), 0.0,
        convert(117), -convert(183), 0.0,
        convert(117), -convert(227), 0.0,

        convert(117), -convert(107), 0.0,
        convert(142), -convert(107), 0.0,
        convert(117), -convert(183), 0.0,

        convert(142), -convert(107), 0.0,
        convert(117), -convert(183), 0.0,
        convert(142), -convert(183), 0.0,

        // right part of the blue badge
        convert(231), -convert(62), 0.0,
        convert(231), -convert(107), 0.0,
        convert(299), -convert(62), 0.0,

        convert(231), -convert(107), 0.0,
        convert(299), -convert(62), 0.0,
        convert(299), -convert(107), 0.0,

        convert(231), -convert(107), 0.0,
        convert(206), -convert(107), 0.0,
        convert(206), -convert(183), 0.0,

        convert(206), -convert(183), 0.0,
        convert(231), -convert(107), 0.0,
        convert(231), -convert(183), 0.0,

        convert(231), -convert(107), 0.0,
        convert(299), -convert(107), 0.0,
        convert(231), -convert(183), 0.0,

        convert(299), -convert(107), 0.0,
        convert(299), -convert(183), 0.0,
        convert(231), -convert(183), 0.0,

        convert(231), -convert(183), 0.0,
        convert(299), -convert(183), 0.0,
        convert(231), -convert(227), 0.0,

        convert(299), -convert(183), 0.0,
        convert(231), -convert(227), 0.0,
        convert(299), -convert(227), 0.0,


        // orange rectangles

        //left most rectangle
        convert(49)+Math.sin(x-.3)*.05, -convert(239), 0.0,
        convert(49)+Math.sin(x-.3)*.05, -convert(262), 0.0,
        convert(71)+Math.sin(x-.3)*.05, -convert(239), 0.0,

        convert(49)+Math.sin(x-.3)*.05, -convert(262), 0.0,
        convert(71)+Math.sin(x-.3)*.05, -convert(239), 0.0,
        convert(71)+Math.sin(x-.3)*.05, -convert(262), 0.0,

        convert(49)+Math.sin(x-.3)*.05, -convert(262), 0.0,
        convert(71)+Math.sin(x-.3)*.05, -convert(262), 0.0,
        convert(71)+Math.sin(x-.3)*.05, -convert(276), 0.0,

        // second rectangle on the left
        convert(95)+Math.sin(x-.3)*.05, -convert(239), 0.0,
        convert(117)+Math.sin(x-.3)*.05, -convert(239), 0.0,
        convert(95)+Math.sin(x-.3)*.05, -convert(290), 0.0,

        convert(95)+Math.sin(x-.3)*.05, -convert(290), 0.0,
        convert(117)+Math.sin(x-.3)*.05, -convert(290), 0.0,
        convert(117)+Math.sin(x-.3)*.05, -convert(239), 0.0,

        convert(95)+Math.sin(x-.3)*.05, -convert(290), 0.0,
        convert(117)+Math.sin(x-.3)*.05, -convert(290), 0.0,
        convert(117)+Math.sin(x-.3)*.05, -convert(305), 0.0,

        // left middle rectangle
        convert(141)+Math.sin(x-.3)*.05, -convert(239), 0.0,
        convert(163)+Math.sin(x-.3)*.05, -convert(239), 0.0,
        convert(141)+Math.sin(x-.3)*.05, -convert(319), 0.0,

        convert(141)+Math.sin(x-.3)*.05, -convert(319), 0.0,
        convert(163)+Math.sin(x-.3)*.05, -convert(239), 0.0,
        convert(163)+Math.sin(x-.3)*.05, -convert(319), 0.0,

        convert(141)+Math.sin(x-.3)*.05, -convert(319), 0.0,
        convert(163)+Math.sin(x-.3)*.05, -convert(319), 0.0,
        convert(163)+Math.sin(x-.3)*.05, -convert(333), 0.0,

        // right middle rectangle
        convert(186)+Math.sin(x-.3)*.05, -convert(239), 0.0,
        convert(208)+Math.sin(x-.3)*.05, -convert(239), 0.0,
        convert(186)+Math.sin(x-.3)*.05, -convert(319), 0.0,

        convert(186)+Math.sin(x-.3)*.05, -convert(319), 0.0,
        convert(208)+Math.sin(x-.3)*.05, -convert(319), 0.0,
        convert(208)+Math.sin(x-.3)*.05, -convert(239), 0.0,

        convert(186)+Math.sin(x-.3)*.05, -convert(333), 0.0,
        convert(208)+Math.sin(x-.3)*.05, -convert(319), 0.0,
        convert(186)+Math.sin(x-.3)*.05, -convert(319), 0.0,

        // second rectangle from the right
        convert(231)+Math.sin(x-.3)*.05, -convert(239), 0.0,
        convert(231)+Math.sin(x-.3)*.05, -convert(290), 0.0,
        convert(253)+Math.sin(x-.3)*.05, -convert(290), 0.0,

        convert(253)+Math.sin(x-.3)*.05, -convert(239), 0.0,
        convert(231)+Math.sin(x-.3)*.05, -convert(239), 0.0,
        convert(253)+Math.sin(x-.3)*.05, -convert(290), 0.0,

        convert(231)+Math.sin(x-.3)*.05, -convert(305), 0.0,
        convert(231)+Math.sin(x-.3)*.05, -convert(290), 0.0,
        convert(253)+Math.sin(x-.3)*.05, -convert(290), 0.0,

        // right most rectangle
        convert(277)+Math.sin(x-.3)*.05, -convert(239), 0.0,
        convert(299)+Math.sin(x-.3)*.05, -convert(262), 0.0,
        convert(299)+Math.sin(x-.3)*.05, -convert(239), 0.0,

        convert(277)+Math.sin(x-.3)*.05, -convert(239), 0.0,
        convert(277)+Math.sin(x-.3)*.05, -convert(262), 0.0,
        convert(299)+Math.sin(x-.3)*.05, -convert(262), 0.0,

        convert(277)+Math.sin(x-.3)*.05, -convert(262), 0.0,
        convert(277)+Math.sin(x-.3)*.05, -convert(276), 0.0,
        convert(299)+Math.sin(x-.3)*.05, -convert(262), 0.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
  vertexPositionBuffer.itemSize = 3;
  vertexPositionBuffer.numberOfItems = 132; //total items included
}
/*
    function startup:
    input: none
    output: none

    Entry point of HTML file, create the canvas, setup the shaders and buffers, change to white background
    and start the animation
*/
function startup() {
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders(); 
  setupBuffers();
  gl.clearColor(0.0, 0.0, 0.0, 0.0);
  gl.enable(gl.DEPTH_TEST);
  tick();
}
/*
    function tick:
    input: none
    output: none

    Redraw the mesh and colors after each animation frame
*/
function tick() {
  requestAnimFrame(tick);
  draw();
  animate();
}