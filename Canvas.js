var canvas = null;
var gl = null;
var canvas_original_width;
var canvas_original_height;
var bFullScreen = false;
var matrixArray = [];
const WEBGL_MACROS = {
    "OAP_ATTRIBUTE_POSITION": 0,
    "OAP_ATTRIBUTE_COLOR": 1,
    "OAP_ATTRIBUTE_NORMAL": 2,
    "OAP_ATTRIBUTE_TEXTURE0": 3,
};
var lineLength = 0.5;
// var rotationMatrix;
var modelViewMatrix;
var modelViewProjectionMatrix;
var vertexShaderObject;
var fragmentShaderObject;
var shaderProgramObject;
var vao, vbo, mvpUniform;
var projectionMatrix;
var requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame;

var axiom = "F";
var sentence = "FF+[+F-F-F]-[-F+F+F]FF+[+F-F-F]-[-F+F+F]+[+FF+[+F-F-F]-[-F+F+F]-FF+[+F-F-F]-[-F+F+F]-FF+[+F-F-F]-[-F+F+F]]-[-FF+[+F-F-F]-[-F+F+F]+FF+[+F-F-F]-[-F+F+F]+FF+[+F-F-F]-[-F+F+F]]FF+[+F-F-F]-[-F+F+F]FF+[+F-F-F]-[-F+F+F]+[+FF+[+F-F-F]-[-F+F+F]-FF+[+F-F-F]-[-F+F+F]-FF+[+F-F-F]-[-F+F+F]]-[-FF+[+F-F-F]-[-F+F+F]+FF+[+F-F-F]-[-F+F+F]+FF+[+F-F-F]-[-F+F+F]]+[+FF+[+F-F-F]-[-F+F+F]FF+[+F-F-F]-[-F+F+F]+[+FF+[+F-F-F]-[-F+F+F]-FF+[+F-F-F]-[-F+F+F]-FF+[+F-F-F]-[-F+F+F]]-[-FF+[+F-F-F]-[-F+F+F]+FF+[+F-F-F]-[-F+F+F]+FF+[+F-F-F]-[-F+F+F]]-FF+[+F-F-F]-[-F+F+F]FF+[+F-F-F]-[-F+F+F]+[+FF+[+F-F-F]-[-F+F+F]-FF+[+F-F-F]-[-F+F+F]-FF+[+F-F-F]-[-F+F+F]]-[-FF+[+F-F-F]-[-F+F+F]+FF+[+F-F-F]-[-F+F+F]+FF+[+F-F-F]-[-F+F+F]]-FF+[+F-F-F]-[-F+F+F]FF+[+F-F-F]-[-F+F+F]+[+FF+[+F-F-F]-[-F+F+F]-FF+[+F-F-F]-[-F+F+F]-FF+[+F-F-F]-[-F+F+F]]-[-FF+[+F-F-F]-[-F+F+F]+FF+[+F-F-F]-[-F+F+F]+FF+[+F-F-F]-[-F+F+F]]]-[-FF+[+F-F-F]-[-F+F+F]FF+[+F-F-F]-[-F+F+F]+[+FF+[+F-F-F]-[-F+F+F]-FF+[+F-F-F]-[-F+F+F]-FF+[+F-F-F]-[-F+F+F]]-[-FF+[+F-F-F]-[-F+F+F]+FF+[+F-F-F]-[-F+F+F]+FF+[+F-F-F]-[-F+F+F]]+FF+[+F-F-F]-[-F+F+F]FF+[+F-F-F]-[-F+F+F]+[+FF+[+F-F-F]-[-F+F+F]-FF+[+F-F-F]-[-F+F+F]-FF+[+F-F-F]-[-F+F+F]]-[-FF+[+F-F-F]-[-F+F+F]+FF+[+F-F-F]-[-F+F+F]+FF+[+F-F-F]-[-F+F+F]]+FF+[+F-F-F]-[-F+F+F]FF+[+F-F-F]-[-F+F+F]+[+FF+[+F-F-F]-[-F+F+F]-FF+[+F-F-F]-[-F+F+F]-FF+[+F-F-F]-[-F+F+F]]-[-FF+[+F-F-F]-[-F+F+F]+FF+[+F-F-F]-[-F+F+F]+FF+[+F-F-F]-[-F+F+F]]]";
var rules = [];
rules[0] = {
    a: "F",
    b: "FF+[+F-F-F]-[-F+F+F]"
};

function main() {

    canvas = document.getElementById("canvas_oap");
    if (!canvas) {
        console.log("Obtaining Canvas Failed.");
    } else {
        console.log("Obtaining Canvas Succeeded.");
    }

    canvas_original_width = canvas.width;
    canvas_original_height = canvas.height;

    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("click", mouseDown, false);
    window.addEventListener("resize", resize, false); //event bubbling
    init();
    resize(); //warm-up resize
    draw(); //warm-up draw
}

function toggleFullScreen() {
    var fullscreen_element = document.fullscreenElement ||  //opera / chrome
        document.webkitFullscreenElement || //safari
        document.mozFullScreenElement || //firefox
        document.msFullscreenElement || //IE
        null;

    if (fullscreen_element == null) {
        if (canvas.requestFullscreen) { //refer function pointer from C
            canvas.requestFullscreen();
        } else if (canvas.webkitRequestFullscreen) {
            canvas.webkitRequestFullscreen();
        } else if (canvas.mozRequestFullScreen) {
            canvas.mozRequestFullScreen();
        } else if (canvas.msRequestFullscreen) {
            canvas.msRequestFullscreen();
        }
        bFullScreen = true;
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        bFullScreen = false;
    }

}
function init() {
    gl = canvas.getContext("webgl2");
    if (!gl) {
        console.log("Obtaining WebGL2 Context Failed.");
    } else {
        console.log("Obtaining WebGL2 Context Succeeded.");
    }
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    var vertexShaderSourceCode =
        "#version 300 es" +
        "\n" +
        "in vec4 vPosition;" +
        "in vec4 vColor;" +
        "out vec4 outColor;" +
        "uniform mat4 u_mvp_matrix;" +
        "void main(void){" +
        "gl_Position = u_mvp_matrix * vPosition;" +
        "gl_PointSize = 5.0;" +
        "outColor = vColor;" +
        "}";
    vertexShaderObject = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShaderObject, vertexShaderSourceCode);
    gl.compileShader(vertexShaderObject);
    if (gl.getShaderParameter(vertexShaderObject, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(vertexShaderObject);
        if (error.length > 0) {
            console.error(error);
            alert(error);
            uninitialize();
        }
    }
    var fragmentShaderSourceCode =
        "#version 300 es" +
        "\n" +
        "precision highp float;" +
        "out vec4 FragColor;" +
        "in vec4 outColor;" +
        "void main(void){" +
        "FragColor = outColor;" +
        "}";
    fragmentShaderObject = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShaderObject, fragmentShaderSourceCode);
    gl.compileShader(fragmentShaderObject);
    if (gl.getShaderParameter(fragmentShaderObject, gl.COMPILE_STATUS) == false) {
        var error = gl.getShaderInfoLog(fragmentShaderObject);
        if (error.length > 0) {
            console.error(error);
            alert(error);
            uninitialize();
        }
    }
    shaderProgramObject = gl.createProgram();
    gl.attachShader(shaderProgramObject, vertexShaderObject);
    gl.attachShader(shaderProgramObject, fragmentShaderObject);
    gl.bindAttribLocation(shaderProgramObject, WEBGL_MACROS.OAP_ATTRIBUTE_POSITION, "vPosition");
    gl.bindAttribLocation(shaderProgramObject, WEBGL_MACROS.OAP_ATTRIBUTE_COLOR, "vColor");
    //linking
    gl.linkProgram(shaderProgramObject);
    if (!gl.getProgramParameter(shaderProgramObject, gl.LINK_STATUS)) {
        var error = gl.getProgramInfoLog(shaderProgramObject);
        if (error.length > 0) {
            alert(error);
            uninitialize();
        }
    }

    mvpUniform = gl.getUniformLocation(shaderProgramObject, "u_mvp_matrix");
    // var cylinderPositions = generateCylinderVertices(0.2, 0.3, 1, 8, 8);
    var linePositions = new Float32Array([
        0, -lineLength, 0,
        0, -lineLength+lineLength, 0
    ]);
    var lineColors = new Float32Array([
        0.0,0.0,1.0,
        1.0,0.718,0.773
    ])
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao); {
        vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo); {
            gl.bufferData(gl.ARRAY_BUFFER, linePositions, gl.STATIC_DRAW);
            // gl.vertexAttrib3f(WEBGL_MACROS.OAP_ATTRIBUTE_COLOR, 1.0, 1.0, 1.0);
            gl.vertexAttribPointer(WEBGL_MACROS.OAP_ATTRIBUTE_POSITION, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(WEBGL_MACROS.OAP_ATTRIBUTE_POSITION);
        } gl.bindBuffer(gl.ARRAY_BUFFER, null);

        vbo_color = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER,vbo_color);{
            gl.bufferData(gl.ARRAY_BUFFER,lineColors,gl.STATIC_DRAW);
            gl.vertexAttribPointer(WEBGL_MACROS.OAP_ATTRIBUTE_COLOR,3,gl.FLOAT,false,0,0);
            gl.enableVertexAttribArray(WEBGL_MACROS.OAP_ATTRIBUTE_COLOR);
        }gl.bindBuffer(gl.ARRAY_BUFFER,null);
    } gl.bindVertexArray(null);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    projectionMatrix = mat4.create();

    
}
function resize() {
    if (bFullScreen == true) {
        canvas.width = window.innerWidth; //only client area (Without border)
        canvas.height = window.innerHeight;
    } else {
        canvas.width = canvas_original_width;
        canvas.height = canvas_original_height;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    mat4.perspective(projectionMatrix, 45.0, parseFloat(canvas.width) / parseFloat(canvas.height), 0.1, 100.0);
}
function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(shaderProgramObject);
    matrixArray = [];
    currentMatrix = mat4.create();
    matrixArray.push(currentMatrix.map((x)=>x));
    modelViewMatrix = matrixArray[matrixArray.length -1];//mat4.create();
    modelViewProjectionMatrix = mat4.create();
    // let rotationMatrix = mat4.create();
    mat4.translate(currentMatrix, currentMatrix, [0, -6.5, -12.0]);
    
    mat4.multiply(modelViewProjectionMatrix, projectionMatrix, currentMatrix);
    gl.uniformMatrix4fv(mvpUniform, false, modelViewProjectionMatrix);
    
    for(let i=0; i<sentence.length;i++){
        // modelViewProjectionMatrix=mat4.create();
        // mat4.multiply(modelViewProjectionMatrix, projectionMatrix, currentMatrix);
        // gl.uniformMatrix4fv(mvpUniform, false, modelViewProjectionMatrix);
        let currentChar = sentence.charAt(i);
        switch(currentChar){
            case "F":
            //drawLine
            translate();
            drawLine();
            
            break;
            case "+":
            //rotate +ve
            rotate(Math.PI/8);           
            break;
            case "-":
            //rotate -ve
            rotate(-Math.PI/8);
            break;
            case "[":
            //save transformation state //push
            matrixArray.push(currentMatrix.map((x)=>x));
            // currentMatrix = matrixArray[matrixArray.length -1];
            break;
            case "]":
            //pop
            // matrixArray.pop();
            currentMatrix = matrixArray[matrixArray.length -1].map((x)=>x);
            matrixArray.pop();
            break;
        }
    }


    // gl.bindVertexArray(vao);
    //     gl.drawArrays(gl.LINES, 0, 2);
    // gl.bindVertexArray(null);
    gl.useProgram(null);

    requestAnimationFrame(render, canvas);
}
function render() {
    draw();
    update();
}
function update() {
    
}
function uninitialize() {
    if (vao) {
        gl.deleteVertexArray(vao);
        vao = null;
    }
    if (vao_cube) {
        gl.deleteVertexArray(vao_cube);
        vao_cube = null;
    }
    if (vbo) {
        gl.deleteVertexArray(vbo);
        vbo = null;
    }
    if (vbo_cube) {
        gl.deleteVertexArray(vbo_cube);
        vbo_cube = null;
    }
    if (vbo_color) {
        gl.deleteVertexArray(vbo_color);
        vbo_color = null;
    }
    if (vbo_cube_color) {
        gl.deleteVertexArray(vbo_cube_color);
        vbo_cube_color = null;
    }
    if (shaderProgramObject) {
        if (fragmentShaderObject) {
            gl.detachShader(shaderProgramObject, fragmentShaderObject);
            gl.deleteShader(fragmentShaderObject);
            fragmentShaderObject = null;
        }
        if (vertexShaderObject) {
            gl.detachShader(shaderProgramObject, vertexShaderObject);
            gl.deleteShader(vertexShaderObject);
            vertexShaderObject = null;
        }
        gl.deleteProgram(shaderProgramObject);
        shaderProgramObject = null;
    }
}
function keyDown(event) {
    switch (event.keyCode) {
        case 27:
            uninitialize();
            window.close();
            break;
        case 70: //f key
            toggleFullScreen();

            break;
    }
}

function mouseDown(event) {
    // alert("Mousebutton is clicked");

}

function generate() {
    var nextSentence = "";
    for (let i = 0; i < sentence.length; i++) {
        let currentChar = sentence.charAt(i);
        let found = false;
        for(let j=0; j<rules.length;j++){
            if(currentChar == rules[j].a){
                nextSentence +=rules[j].b;
                found = true;
                break;
            }
        }
        if(!found){
            nextSentence += currentChar;
        }
        
    }
    sentence = nextSentence;
    console.log(sentence);
}


function translate(){
    mat4.translate(currentMatrix, currentMatrix, [0, lineLength, 0.0]);
    modelViewProjectionMatrix = mat4.create();
    mat4.multiply(modelViewProjectionMatrix, projectionMatrix, currentMatrix);
    gl.uniformMatrix4fv(mvpUniform, false, modelViewProjectionMatrix);
}
function drawLine(){
    gl.bindVertexArray(vao);
        gl.drawArrays(gl.LINES, 0, 2);
    gl.bindVertexArray(null);
}
function rotate(angle){
    let rotationMatrix = mat4.create();
    mat4.rotateZ(rotationMatrix, rotationMatrix, angle);
    mat4.multiply(currentMatrix, currentMatrix, rotationMatrix);
    modelViewProjectionMatrix = mat4.create();
    mat4.multiply(modelViewProjectionMatrix, projectionMatrix, currentMatrix);
    gl.uniformMatrix4fv(mvpUniform, false, modelViewProjectionMatrix);
}