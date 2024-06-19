import { compatibleCore } from "./misc.js";

let isV12 = false;

/*
function selectMP(selected, options) {
    const escapedValue = RegExp.escape(Handlebars.escapeExpression(selected));
    const rgx = new RegExp(` value=[\"']${escapedValue}[\"\']`);
    const html = options.fn(this);
    return html.replace(rgx, "$& selected");
}
    */

export function compatibilityInit() {
    isV12 = compatibleCore('12');

    /**
     * This is to prevent the handlebar compatibility warning in forms by temporarily registering a custom handlebar. When v11 support is dropped, replace all {{#selectMP}} instances with {{#selectOptions}}
     */
    //if (isV12)           Handlebars.registerHelper('selectMP', selectMP);
    //else                                Handlebars.registerHelper('selectMP', Handlebars.helpers.select);
}

export function compatibilityHandler(id, ...args) {
    //console.log('combatibiliyHandler',id, args)

    if (id == 'mergeObject')            return mergeObj(args);
    else if (id == 'sceneTab')          return sceneTab(args[0]);
    else if (id == 'sceneTabContents')  return sceneTabContents(args[0]);
    else if (id == 'gridSize')          return gridSize();
    else if (id == 'getCenter')         return getCenter(args[0], args[1], args[2]);
    else if (id == 'clamp')             return clamp(args[0], args[1], args[2]);
    else if (id == 'refreshVision')     refreshVision();
}

function mergeObj(args) {
    if (isV12)   return foundry.utils.mergeObject(args[0], args[1], args[2]);
    else         return mergeObject(args[0], args[1], args[2]);
}

function sceneTab(html) {
    if (isV12)  return html.find(".sheet-tabs:not(.secondary-tabs)").find(".item").last();
    else        return html.find(".tabs .item").last();
}

function sceneTabContents(html) {
    if (isV12)  return html.find(".sheet-tabs:not(.secondary-tabs)");
    else        return html.find(".tab").last();
}

function gridSize() {
    if (isV12)  return canvas.grid.size;
    else        return canvas.grid.grid.options.dimensions.distance;
}

function getCenter(obj, x, y) {
    if (isV12)  {
        const centerPoint = obj.getCenterPoint({x, y});
        return [centerPoint.x, centerPoint.y];
    }
    else        return obj.getCenter(x,y);
}

function clamp(num, min, max) {
    if (isV12)  return Math.clamp(num, min, max);
    else        return Math.clamped(num, min, max);
}

function refreshVision() {
    if (isV12) canvas.perception.update({refreshVision: true});
}