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
var colorAttribPointer;

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

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    colorAttribPointer = gl.getUniformLocation(shaderProgram, "uColor");

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
var vertexNormalBuffer;

function initBuffers() {
    squareVertexPositionBuffer = gl.createBuffer();
    squareVertexColorBuffer = gl.createBuffer();
    vertexNormalBuffer = gl.createBuffer();

    setDefaultAnimationEnds();
}

function renderCube(W, H, L, r, g, b) {
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    var vertices = [
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


    var normals = [
        // Front face
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        // Back face
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        // Top face
        0, 1, 1,
        0, 1, 1,
        0, 1, 1,
        0, 1, 1,

        // Bottom face
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        // Right face
        1, 0, 1,
        1, 0, 1,
        1, 0, 1,
        1, 0, 1,

        // Left face
        1, 1, 0,
        1, 1, 0,
        1, 1, 0,
        1, 1, 0
    ];

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    vertexNormalBuffer.itemSize = 3;
    vertexNormalBuffer.numItems = normals.length / 3;

    gl.uniform4fv(colorAttribPointer, [r, g, b, 1.0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
}

// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
// -----------------------------------------------------------------------
// higher level implementation

state = {
    SHOW_ALL : 0,
    CT1 : 1
};

defstate = state.SHOW_ALL;

function somaV() {
    mvPushMatrix();
    renderCube(1, 2, 1, 1, 0, 1);
    mat4.translate(mvMatrix, [2.0, -1.0, 0.0]);
    renderCube(1, 1, 1, 1, 0, 1);
    mvPopMatrix();
}

function somaL() {
    mvPushMatrix();
    renderCube(1, 3, 1, 1, 0, 0);
    mat4.translate(mvMatrix, [2.0, -2.0, 0.0]);
    renderCube(1, 1, 1, 1, 0, 0);
    mvPopMatrix();
}

function somaT() {
    mvPushMatrix();
    renderCube(1, 3, 1, 1, 1, 0);
    mat4.translate(mvMatrix, [2.0, 0.0, 0.0]);
    renderCube(1, 1, 1, 1, 1, 0);
    mvPopMatrix();
}

function somaZ() {
    mvPushMatrix();
    renderCube(1, 2, 1, 0, 0, 1);
    mat4.translate(mvMatrix, [2.0, 2.0, 0.0]);
    renderCube(1, 2, 1, 0, 0, 1);
    mvPopMatrix();
}

function somaA() {
    mvPushMatrix();
    mat4.translate(mvMatrix, [1.0, 1.0, 0.0]);
    renderCube(1, 2, 1, 0, 1, 0);
    mat4.translate(mvMatrix, [-1.0, -1.0, 2.0]);
    renderCube(2, 1, 1, 0, 1, 0);
    mvPopMatrix();
}

function somaB() {
    mvPushMatrix();
    mat4.translate(mvMatrix, [1.0, 1.0, 0.0]);
    renderCube(1, 2, 1, 0.75, 0.75, 0.75);
    mat4.translate(mvMatrix, [-2.0, -1.0, 1.0]);
    renderCube(1, 1, 2, 0.75, 0.75, 0.75);
    mvPopMatrix();
}

function somaP() {
    mvPushMatrix();
    mat4.translate(mvMatrix, [1.0, 1.0, 0.0]);
    renderCube(1, 2, 1, 0, 1, 1);
    mat4.translate(mvMatrix, [0.0, -1.0, 1.0]);
    renderCube(1, 1, 1, 0, 1, 1);
    mat4.translate(mvMatrix, [-2.0, 0.0, -1.0]);
    renderCube(1, 1, 1, 0, 1, 1);
    mvPopMatrix();
}

function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    mat4.identity(mvMatrix);

    switch(defstate) {
        case state.SHOW_ALL:
            mat4.translate(mvMatrix, [-7.0, -6.0, -25.0]);
            break;
        case state.CT1:
            mat4.translate(mvMatrix, [0, 6.0, -25.0]);
            applyPerspectiveRot();
            break;
    }

    mvPushMatrix();

    // V-1
    switch (defstate) {
        case state.SHOW_ALL:
            applyRot();
            somaV();
            mvPopMatrix();
            break;
        case state.CT1:
            //mvPushMatrix();
            //somaV();
            //mvPopMatrix();
            break;
    }

    // L-2
    switch (defstate) {
        case state.SHOW_ALL:
            mat4.translate(mvMatrix, [6.0, 0.0, 0.0]);
            applyRot();
            somaL();
            mvPopMatrix();
            break;
        case state.CT1:
            mvPushMatrix();
            mat4.translate(mvMatrix, [-5.0, -2.0, 0.0]);
            mat4.rotate(mvMatrix, degToRad(270),  [1, 0, 0]);
            mat4.rotate(mvMatrix, degToRad(0), [0, 1, 0]);
            mat4.rotate(mvMatrix, degToRad(270),  [0, 0, 1]);
            somaL();
            mvPopMatrix();
            break;
    }

    // T-3
    switch (defstate) {
        case state.SHOW_ALL:
            mat4.translate(mvMatrix, [6.0, 0.0, 0.0]);
            applyRot();
            somaT();
            mvPopMatrix();
            break;
        case state.CT1:

            break;
    }

    // Z-4
    switch (defstate) {
        case state.SHOW_ALL:
            mat4.translate(mvMatrix, [0.0, 6.0, 0.0]);
            applyRot();
            somaZ();
            mvPopMatrix();
            break;
        case state.CT1:

            break;
    }

    // A-5
    switch (defstate) {
        case state.SHOW_ALL:
            mat4.translate(mvMatrix, [-6.0, 0.0, 0.0]);
            applyRot();
            somaA();
            mvPopMatrix();
            break;
        case state.CT1:
            mvPushMatrix();
            mat4.translate(mvMatrix, [-6.0, 0.0, 0.0]);
            somaA();
            mvPopMatrix();
            break;
    }

    // B-6
    switch (defstate) {
        case state.SHOW_ALL:
            mat4.translate(mvMatrix, [-6.0, 0.0, 0.0]);
            applyRot();
            somaB();
            mvPopMatrix();
            break;
        case state.CT1:

            break;
    }

    // P-7
    switch (defstate) {
        case state.SHOW_ALL:
            mat4.translate(mvMatrix, [6.0, 6.0, 0.0]);
            applyRot();
            somaP();
            mvPopMatrix();
            break;
        case state.CT1:

            break;
    }

    mvPopMatrix();
}

function applyRot() {
    mvPushMatrix();
    mat4.rotate(mvMatrix, degToRad(rot), [1, 1, 1]);
}

function applyPerspectiveRot() {
    mat4.rotate(mvMatrix, degToRad(30), [1, 0, 0]);
    mat4.rotate(mvMatrix, degToRad(90), [0, 1, 0]);
}

var f1t = mat4.create();
function setDefaultAnimationEnds() {
    mat4.identity(f1t);
    mat4.translate(f1t, [0, 0.1, 0]);
}

var lastTime = 0;
function animate() {

    var timeNow = new Date().getTime();

    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        //if (defstate == state.SHOW_ALL)
            animateAll(elapsed);
        //else
        //    animateConstruction(elapsed);
    }
    lastTime = timeNow;
}

function animateAll(elapsed) {
    rot += (90 * elapsed) / 1000.0;
}

//var frac = 0;
//var lastFrac = 0;
//function animateConstruction(elapsed) {

    //var cur = new Date().getTime() / 1000;
    //
    //if (lastFrac == 0) {
    //    lastFrac = cur + 1;
    //}
    //
    //frac = frac < 4 ? 1 - (lastFrac - cur) : 4;
    //
    //
    //
    //switch (defstate) {
    //    case state.CT1:
    //        mat4.translate(mvMatrix, [-7.0, -6.0, -25.0]);
    //        //mvPushMatrix();
    //        //if (frac < 4) {
    //            mat4.translate(mvMatrix, [0, frac, 0]);
    //        //}
    //        //if (frac < 3) {
    //            mat4.translate(mvMatrix, [frac, 0, 0]);
    //        //}
    //        somaV();
    //        //mvPopMatrix();
    //
    //
    //        break;
    //}
//}

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