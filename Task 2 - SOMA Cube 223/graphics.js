var gl;

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}


function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


var shaderProgram;

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}


var mvMatrix = mat4.create();
var pMatrix = mat4.create();

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

var rot = 0.0;

var squareVertexPositionBuffer;
var squareVertexColorBuffer;

function initBuffers() {

    squareVertexPositionBuffer = gl.createBuffer();
    squareVertexColorBuffer = gl.createBuffer();
}

function renderQuad(W, H) {
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    vertices = [
        W,  H,  0.0,
        -W,  H,  0.0,
        W, -H,  0.0,
        -W, -H,  0.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = vertices.length / 3;

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
    var colors = [];
    for (var i=0; i <  vertices.length / 3; i++) {
        colors = colors.concat([0.4, 0.5, 1.0, 1.0]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    squareVertexColorBuffer.itemSize = 4;
    squareVertexColorBuffer.numItems =  vertices.length / 3;

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}

function renderCube(W, H, L) {
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    vertices = [
        // Front face
        -W, -H,  L,
        W, -H,   L,
        W,  H,   L,
        -W,  H,  L,

        // Back face
        -W, -H, -L,
        -W,  H, -L,
        W,   H, -L,
        W,  -H, -L,

        // Top face
        -W,  H, -L,
        -W,  H,  L,
        W,  H,   L,
        W,  H,  -L,

        // Bottom face
        -W, -H, -L,
        W, -H,  -L,
        W, -H,   L,
        -W, -H,  L,

        // Right face
        W, -H,  -L,
        W,  H,  -L,
        W,  H,   L,
        W, -H,   L,

        // Left face
        -W, -H, -L,
        -W, -H,  L,
        -W,  H,  L,
        -W,  H, -L
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = vertices.length / 3;

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
    var colors = [];
    for (var i=0; i <  vertices.length / 3; i++) {
        colors = colors.concat([0.4, 0.5, 1.0, 1.0]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    squareVertexColorBuffer.itemSize = 4;
    squareVertexColorBuffer.numItems =  vertices.length / 3;

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}

function somaV() {
    mvPushMatrix();
    mat4.rotate(mvMatrix, degToRad(rot), [1, 1, 0]);
    renderCube(1, 2, 1);
    mat4.translate(mvMatrix, [2.0, -1.0, 0.0]);
    renderCube(1, 1, 1);
    mvPopMatrix();
}

function somaL() {
    mvPushMatrix();
    mat4.rotate(mvMatrix, degToRad(rot), [1, 1, 0]);
    renderCube(1, 3, 1);
    mat4.translate(mvMatrix, [2.0, -2.0, 0.0]);
    renderCube(1, 1, 1);
    mvPopMatrix();
}

function somaT() {
    mvPushMatrix();
    mat4.rotate(mvMatrix, degToRad(rot), [1, 1, 0]);
    renderCube(1, 3, 1);
    mat4.translate(mvMatrix, [2.0, 0.0, 0.0]);
    renderCube(1, 1, 1);
    mvPopMatrix();
}

function somaZ() {
    mvPushMatrix();
    mat4.rotate(mvMatrix, degToRad(rot), [1, 1, 0]);
    renderCube(1, 2, 1);
    mat4.translate(mvMatrix, [2.0, 2.0, 0.0]);
    renderCube(1, 2, 1);
    mvPopMatrix();
}

function somaA() {
    mvPushMatrix();
    //mat4.rotate(mvMatrix, degToRad(rot), [1, 1, 0]);
    mat4.translate(mvMatrix, [1.0, 1.0, 0.0]);
    renderCube(1, 2, 1);
    mat4.translate(mvMatrix, [-1.0, -1.0, 2.0]);
    renderCube(2, 1, 1);
    mvPopMatrix();
}

function somaB() {
    mvPushMatrix();
    //mat4.rotate(mvMatrix, degToRad(rot), [1, 1, 0]);
    mat4.translate(mvMatrix, [1.0, 1.0, 0.0]);
    renderCube(1, 2, 1);
    mat4.translate(mvMatrix, [-2.0, -1.0, 1.0]);
    renderCube(1, 1, 2);
    mvPopMatrix();
}

function somaP() {
    mvPushMatrix();
    //mat4.rotate(mvMatrix, degToRad(rot), [1, 1, 0]);
    mat4.translate(mvMatrix, [1.0, 1.0, 0.0]);
    renderCube(1, 2, 1);
    mat4.translate(mvMatrix, [0.0, -1.0, 1.0]);
    renderCube(1, 1, 1);
    mat4.translate(mvMatrix, [-2.0, 0.0, -1.0]);
    renderCube(1, 1, 1);
    mvPopMatrix();
}

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    mat4.identity(mvMatrix);

    // first object

    mat4.translate(mvMatrix, [-1.0, -1.0, -10.0]);

    somaP();

    //mat4.translate(mvMatrix, [0, -3.0, 0.0]);
    //mat4.rotate(mvMatrix, degToRad(rot), [1, 0, 0]);
    //renderQuad(1, 2);

}

var lastTime = 0;
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;

        rot += (90 * elapsed) / 1000.0;
    }
    lastTime = timeNow;
}

var mvMatrixStack = [];


function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}


function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function tick() {
    requestAnimFrame(tick);

    drawScene();
    animate();
}



function webGLStart() {
    var canvas = document.getElementById("lesson02-canvas");
    initGL(canvas);
    initShaders();
    initBuffers();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //drawScene();
    tick();
}