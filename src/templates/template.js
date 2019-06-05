/**
 * Create a Template resource from raw database data.
 *
 * This is called by TemplateHandler after all assets referenced
 * by template_id in entities here have been loaded.
 * Therefore entities can be expanded right away.
 *
 * Calling SceneParser requires script assets referenced in components
 * to be loaded. We do it when 'instantiate' is called for the first
 * time, after the scene has been parsed, which in turn happens
 * after all scripts are loaded.
 *
 */

Object.assign(pc, function () {

    var Template = function Template(app, data) {
        this._app = app;

        this._data = data;

        this._expandedData = {};

        this._instanceGuids = [];
    };

    Template.prototype.instantiate = function (saveGuid) {
        if (!this._templateRoot) { // at first use, after scripts are loaded
            this._parseTemplate();
        }

        var instance = this._templateRoot.clone();

        if (saveGuid) {
            this._instanceGuids.push(instance.getGuid());
        }

        return instance;
    };

    Template.prototype.getExpandedData = function () {
        if (!this._expandedData.entities) {
            this._expandedData.entities = pc.TemplateUtils.expandTemplateEntities(
                this._app, this._data.entities);
        }

        return this._expandedData;
    };

    Template.prototype._parseTemplate = function () {
        var parser = new pc.SceneParser(this._app);

        this._templateRoot = parser.parse(this.getExpandedData());
    };

    Template.prototype.applyToInstances = function (callback) {
        for (var i = 0; i < this._instanceGuids.length; i++) {
            var guid = this._instanceGuids[i];

            var entity = this._app.root.findByGuid(guid);

            callback(entity, i, guid);
        }
    };

    return {
        Template: Template
    };
}());