export const AssetTypes = Object.freeze({
    SPRITE: 'SPRITE',
    SPRITE_SHEET: 'SPRITE_SHEET',
    TILE_MAP: 'TILE_MAP',
    TEXTURE: 'TEXTURE',
    AUDIO: 'AUDIO'
});

export class Asset {

    #type;

    #source;

    #alias;

    #meta;

    #content;

    #loaded;

    constructor(type, content, source, alias = source) {
        if (!Object.values(AssetTypes).includes(type)) {
            throw Error("Illegal asset type " + type + ". Expect one of " + Object.values(AssetTypes).join(', '));
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

export class Assets {

    static loadSpriteSheet(source) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = source;

            const asset = new Asset(AssetTypes.SPRITE_SHEET, image, source);

            image.onload = function() {
                console.log('Image loaded successfully');
                asset.loaded = true;
                resolve(asset);
            };

            image.onerror = function() {
                console.log('Image load failed');
                reject(new Error('Image load failed'));
            };
        });
    }
}
