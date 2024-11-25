export {ResourceType, Resource, ResourceLoader, ResourceManager}

const ResourceType = Object.freeze({
    IMAGE: 'IMAGE',
    TEXTURE: 'TEXTURE',
    AUDIO: 'AUDIO'
});

class Resource {
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

class ResourceCache {
    #resources = new Map();
    #refCounts = new Map();

    add(key, resource) {
        if (this.#resources.has(key)) {
            console.warn(`Resource with key "${key}" already exists in cache.`);
            return;
        }
        this.#resources.set(key, resource);
        this.#refCounts.set(key, 0);
    }

    put(key) {
        if (!this.#resources.has(key)) {
            return undefined;
        }
        const currentRefCount = this.#refCounts.get(key);
        this.#refCounts.set(key, currentRefCount + 1);
        return this.#resources.get(key);
    }

    delete(key) {
        if (!this.#resources.has(key)) {
            console.warn(`Resource with key "${key}" not found in cache.`);
            return;
        }

        const currentRefCount = this.#refCounts.get(key);
        if (currentRefCount <= 0) {
            console.warn(`Resource with key "${key}" has no references to delete.`);
            return;
        }

        const newRefCount = currentRefCount - 1;
        this.#refCounts.set(key, newRefCount);

        if (newRefCount === 0) {
            this.#resources.delete(key);
            this.#refCounts.delete(key);
        }
    }

    deleteForce(key) {
        if (!this.#resources.has(key)) {
            console.warn(`Resource with key "${key}" not found in cache.`);
            return;
        }
        this.#resources.delete(key);
        this.#refCounts.delete(key);
    }

    clear() {
        this.#resources.clear();
        this.#refCounts.clear();
    }

    has(key) {
        return this.#resources.has(key);
    }
}

class ResourceLoadingStrategy {

    load(source) {
        return new Promise((resolve, reject) => {resolve();});
    }
}

class ImageLoading extends ResourceLoadingStrategy {

    load(source) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = source;
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`Failed to load image from ${source}`));
        });
    }
}

class TextureLoading extends ResourceLoadingStrategy {

    constructor(gl) {
        super();
        this.gl = gl;
    }

    load(source) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = source;
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`Failed to load texture from ${source}`));
        })
        .then(image => this.createTextureFromImage(image))
        .catch(e => new Error(`Failed to load texture from ${source}`));
    }

    createTextureFromImage(image) {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        return texture;
    }
}

class AudioLoading extends ResourceLoadingStrategy {
    load(source) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.src = source;
            audio.onload
            audio.onload = () => resolve(audio);
            audio.onerror = () => reject(new Error(`Failed to load image from ${source}`));
        });
    }
}

class ResourceLoader {
    #resourceLoadingStrategies;

    constructor(gl) {
        this.#resourceLoadingStrategies = {
            [ResourceType.IMAGE]: new ImageLoading(),
            [ResourceType.TEXTURE]: new TextureLoading(gl),
            [ResourceType.AUDIO]: new AudioLoading()
        };
    }

    load(type, source) {
        const loading = this.#resourceLoadingStrategies[type];
        if (!loading) {
            throw new Error(`No loader available for resource type: ${type}`);
        }

        return loading.load(source);
    }
}

class ResourceManager {

    constructor(gl) {
        this.gl = gl;
        this.resources = new Map();
        this.resourceLoader = new ResourceLoader(gl);
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
            resource.source = await this.resourceLoader.load(resource.type, resource.filePath);
        }

        resource.usageCount += 1;
        return resource.source;
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
