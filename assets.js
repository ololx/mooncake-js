export const AssetTypes = Object.freeze({
    SPRITE: 'SPRITE',
    SPRITE_SHEET: 'SPRITE_SHEET',
    TEXTURE: 'TEXTURE',
    AUDIO: 'AUDIO'
});

export class Asset {

    _type;

    _source;

    _name;

    _loaded;

    _content;

    constructor(type, source, name = source) {
        if (!AssetTypes.hasOwnProperty(type)) {
            throw Error("Illegal asset type " + type);
        }

        this._type = type;
        this._source = source;
        this._name = name;
        this._loaded = false;
    }

    get name() {
        return this._name;
    }

    get isLoaded() {
        return this._loaded;
    }

    get content() {
        return this._content;
    }

    set content(content) {
        return this._content;
    }
}

export class Sprite extends Asset {

    _type;

    _source;

    _name;

    _loaded;

    _content;

    constructor(source, name = source) {
        super(AssetTypes.SPRITE, source, name)
    }
}

export class SpriteSheet extends Asset {

    _type;

    _source;

    _name;

    _loaded;

    _content;

    constructor(source, name = source) {
        super(AssetTypes.SPRITE, source, name)
    }
}
