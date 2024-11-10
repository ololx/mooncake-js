export const ResourceType = Object.freeze({
    IMAGE: 'IMAGE',
    TEXTURE: 'TEXTURE',
    AUDIO: 'AUDIO'
});

export class Resource {

    _type;

    _source;

    _alias;

    _meta;

    _content;

    _loaded;

    constructor(type, content, source, alias = source) {
        if (!Object.values(ResourceType).includes(type)) {
            throw Error("Illegal resource type " + type + ". Expect one of " + Object.values(ResourceType).join(', '));
        }

        this._type = type;
        this._content = content;
        this._source = source;
        this._alias = alias;
    }

    get source() {
        return this._source;
    }

    get type() {
        return this._type;
    }

    get alias() {
        return this._alias;
    }

    get content() {
        return this._content;
    }

    get loaded() {
        return this._loaded;
    }

    set loaded(loaded) {
        this._loaded = loaded;
    }
}

export class Resources {

    static loadSpriteSheet(source) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = source;

            const asset = new Resource(ResourceType.IMAGE, image, source);

            console.log("IIMG_1: " + image.complete)

            image.onload = function() {
                console.log('Image loaded successfully');
                asset.loaded = true;
                resolve(asset);
                console.log("IIMG_2: " + image.complete)
            };

            image.onerror = function() {
                console.log('Image load failed');
                reject(new Error('Image load failed'));
            };

            console.log("IIMG_3: " + image.complete)
        });
    }
}

export class ResourceManager {
    constructor(gl) {
        this.gl = gl;
        this.resources = new Map();
    }

    importResource(filePath, type, importSettings = { compressed: false, format: 'default' }) {
        const guid = this.generateGUID(filePath);

        if (this.resources.has(guid)) {
            return this.resources.get(guid);
        }

        const resourceMeta = {
            guid,
            filePath,
            type,
            importSettings,
            source: null,
            width: 0,
            height: 0,
            usageCount: 0
        };

        this.resources.set(guid, resourceMeta);
        return resourceMeta;
    }

    async loadResource(filePath) {
        const guid = this.generateGUID(filePath);

        if (!this.resources.has(guid)) {
            throw new Error(`Resource ${filePath} not imported. Please import it first.`);
        }

        const resource = this.resources.get(guid);

        if (!resource.source) {
            resource.source = await this._loadResourceData(resource);
        }

        resource.usageCount += 1;
        return resource.source;
    }

    async _loadResourceData(resource) {
        if (resource.type === 'image') {
            return await this.loadImage(resource.filePath, resource.importSettings);
        } else if (resource.type === 'audio') {
            return await this.loadAudio(resource.filePath);
        } else {
            throw new Error(`Unknown resource type: ${resource.type}`);
        }
    }

    async loadImage(filePath, importSettings) {
        const image = await new Promise((resolve, reject) => {
            const img = new Image();
            img.src = filePath;
            img.onload = () => resolve(img);
            img.onerror = reject;
        });

        if (importSettings.compressed) {
        }

        return this.createTextureFromImage(image);
    }

    async loadAudio(filePath) {
        const audio = new Audio(filePath);
        await audio.load();
        return audio;
    }

    createTextureFromImage(image) {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        return texture;
    }

    releaseResource(filePath) {
        const guid = this.generateGUID(filePath);
        if (this.resources.has(guid)) {
            const resource = this.resources.get(guid);
            resource.usageCount -= 1;

            if (resource.usageCount <= 0) {
                this.unloadResource(guid);
            }
        }
    }

    unloadResource(guid) {
        const resource = this.resources.get(guid);
        if (resource && resource.source) {
            if (resource.type === 'image' && resource.source instanceof WebGLTexture) {
                this.gl.deleteTexture(resource.source);
            }
            resource.source = null;
        }
    }

    generateGUID(filePath) {
        return btoa(filePath);
    }
}
