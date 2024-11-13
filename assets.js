export const ResourceType = Object.freeze({
    IMAGE: 'IMAGE',
    TEXTURE: 'TEXTURE',
    AUDIO: 'AUDIO'
});

export class Resource {
    #type;
    #source;
    #alias;
    #meta;
    #content;
    #loaded;

    constructor(type, content, source, alias = source) {
        if (!Object.values(ResourceType).includes(type)) {
            throw Error("Illegal resource type " + type + ". Expect one of " + Object.values(ResourceType).join(', '));
        }

        this.#type = type;
        this.#content = content;
        this.#source = source;
        this.#alias = alias;
        this.#loaded = false;
    }

    get source() {
        return this.#source;
    }

    get type() {
        return this.#type;
    }

    get alias() {
        return this.#alias;
    }

    get content() {
        return this.#content;
    }

    get loaded() {
        return this.#loaded;
    }

    set loaded(loaded) {
        this.#loaded = loaded;
    }
}

export class ResourceCache {
    #cache;

    constructor(cache = new Map()) {
        this.cache = cache;
    }

    add(resource) {
        this.cache.set(resource.alias, resource);
    }

    get(alias) {
        return this.cache.get(alias);
    }

    has(alias) {
        return this.cache.has(alias);
    }

    remove(alias) {
        return this.cache.delete(alias);
    }
}

class ImageLoader {
    async load(source) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = source;
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`Failed to load image from ${source}`));
        });
    }
}

class TextureLoader {
    constructor(gl) {
        this.gl = gl;
    }

    async load(source) {
        const imageLoader = new ImageLoader();
        const image = await imageLoader.load(source);

        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        return texture;
    }
}

class AudioLoader {
    async load(source) {
        const audio = new Audio(source);
        await new Promise((resolve, reject) => {
            audio.onloadeddata = resolve;
            audio.onerror = () => reject(new Error(`Failed to load audio from ${source}`));
        });
        return audio;
    }
}

export class ResourceLoader {
    constructor(gl) {
        this.gl = gl;
        this.resourceCache = new ResourceCache();
        this.loaders = {
            [ResourceType.IMAGE]: new ImageLoader(),
            [ResourceType.TEXTURE]: new TextureLoader(gl),
            [ResourceType.AUDIO]: new AudioLoader()
        };
    }

    async loadResource(type, source, alias = source) {
        if (this.resourceCache.has(alias)) {
            const cachedResource = this.resourceCache.get(alias);
            return cachedResource.content;
        }

        const loader = this.loaders[type];
        if (!loader) {
            throw new Error(`No loader available for resource type: ${type}`);
        }

        const content = await loader.load(source);

        const resource = new Resource(type, content, source, alias);
        resource.loaded = true;
        this.resourceCache.add(resource);

        return content;
    }

    releaseResource(alias) {
        const resource = this.resourceCache.get(alias);
        if (resource && resource.type === ResourceType.TEXTURE) {
            this.gl.deleteTexture(resource.content);
        }
        this.resourceCache.remove(alias);
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
