export { GraphicParameters, SpriteFrame, AnimatedSprite, SpriteAnimation } from './graphic_object.js';


export class GraphicsContext {
    drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {}
    clear() {}
    createTexture(image) {}
}

class Canvas2DContext extends GraphicsContext {
    constructor(canvas) {
        super();
        this.ctx = canvas.getContext('2d');
    }

    drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
        this.ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    createTexture(image) {
        // В Canvas2D фактически нет необходимости в создании текстуры, мы просто возвращаем изображение
        return image;
    }
}

export class WebGlContext extends GraphicsContext {
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2');

        if (!this.gl) {
            alert("Ваш браузер не поддерживает WebGL");
            return;
        }

        this.program = null;
        this.positionBuffer = null;
        this.texCoordBuffer = null;

        this.initShaders();
        this.initBuffers();
    }

    initShaders() {
        const vertexShaderSource = `
                attribute vec2 a_position;
                attribute vec2 a_texCoord;
                varying vec2 v_texCoord;
                void main() {
                    gl_Position = vec4(a_position, 0, 1);
                    v_texCoord = a_texCoord;
                }
            `;

        const fragmentShaderSource = `
                precision mediump float;
                varying vec2 v_texCoord;
                uniform sampler2D u_texture;
                void main() {
                    gl_FragColor = texture2D(u_texture, v_texCoord);
                }
            `;

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        this.program = this.createProgram(vertexShader, fragmentShader);
        this.gl.useProgram(this.program);
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error(this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error(this.gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    initBuffers() {
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        const positionLocation = this.gl.getAttribLocation(this.program, "a_position");
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.texCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);

        const texCoordLocation = this.gl.getAttribLocation(this.program, "a_texCoord");
        this.gl.enableVertexAttribArray(texCoordLocation);
        this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);
    }

    resize() {
        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
    }

    createTexture(image) {
        let texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

        return texture;
    }

    normalizeTextureCoordinates(imageWidth, imageHeight, sx, sy, sWidth, sHeight) {
        const texSx = sx / imageWidth;
        const texSy = sy / imageHeight;
        const texSWidth = sWidth / imageWidth;
        const texSHeight = sHeight / imageHeight;
        return { texSx, texSy, texSWidth, texSHeight };
    }

    drawImage(texture, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        const { texSx, texSy, texSWidth, texSHeight } = this.normalizeTextureCoordinates(1020, 204, sx, sy, sWidth, sHeight);

        const texCoords = new Float32Array([
            texSx, texSy + texSHeight,
            texSx + texSWidth, texSy + texSHeight,
            texSx, texSy,
            texSx + texSWidth, texSy
        ]);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);

        const normalizedX = (dx / this.canvas.width) * 2 - 1;
        const normalizedY = (dy / this.canvas.height) * -2 + 1;
        const normalizedW = (dWidth / this.canvas.width) * 2;
        const normalizedH = (dHeight / this.canvas.height) * 2;

        const positions = new Float32Array([
            normalizedX, normalizedY,
            normalizedX + normalizedW, normalizedY,
            normalizedX, normalizedY + normalizedH,
            normalizedX + normalizedW, normalizedY + normalizedH
        ]);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
}
