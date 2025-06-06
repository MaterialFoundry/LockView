import { moduleName, documentationUrl } from "../lockview.js";

export class Helpers {

    static getDocumentationUrl(path) {
        return `${documentationUrl}/${path}`;
    }
    
    static localize(str, category='', formatData) {
        if (category === 'ALL') return game.i18n.format(str, formatData);
        if (category === undefined || category === '') return game.i18n.format(`LOCKVIEW.${str}`, formatData)
        return game.i18n.format(`LOCKVIEW.${category}.${str}`, formatData);
    }

    static getNestedObjectValue(key, obj) {
        const syncSplit = key.split('.');
        let sett = structuredClone(obj);
        for (let segment of syncSplit) {
            if (!sett) break;
            sett = sett[segment]
            if (!sett) break;
        }
        return sett;
    }

    static setNestedObjectValue(key, obj, val) {
        const syncSplit = key.split('.');
        let sett = obj;
        for (let i in syncSplit) {
            const segment = syncSplit[i];
            if (i == syncSplit.length-1) {
                sett[segment] = val;
            }
            else {
                if (!sett[segment]) sett[segment] = {};
                sett = sett[segment];
            }
        }
        return obj;
    }

    static moveObjectElement(currentKey, afterKey, obj) {
        var result = {};
        var val = obj[currentKey];
        delete obj[currentKey];
        var next = -1;
        var i = 0;
        if(typeof afterKey == 'undefined' || afterKey == null) afterKey = '';
        $.each(obj, function(k, v) {
            if((afterKey == '' && i == 0) || next == 1) {
                result[currentKey] = val; 
                next = 0;
            }
            if(k == afterKey) { next = 1; }
            result[k] = v;
            ++i;
        });
        if(next == 1) {
            result[currentKey] = val; 
        }
        if(next !== -1) return result; else return obj;
    }

    static setSignificance(val, sig) {
        const multiplier = Math.pow(10, sig);
        return Math.floor(val*multiplier)/multiplier;
    }

    static getUserSetting(key, userId=game.userId) {
        const userSettings = game.settings.get(moduleName, 'userSettings');
        const userSetting = userSettings.find(s => s.id === userId);
        if (userSetting[key]) return userSetting[key];
        const defaultUserSettings = game.settings.get(moduleName, 'defaultUserSettings');
        return defaultUserSettings[key];
    }

    static getSidebarWidth() {
        return ui.sidebar.expanded ? document.getElementById('sidebar-content').scrollWidth : 0;
    }
}