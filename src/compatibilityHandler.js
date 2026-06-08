import { Helpers } from "./helpers.js";

let isV13, isV14;

export class CompatibilityHandler {

    static get v13() { 
        if (isV13 === undefined) isV13 = foundry.utils.isNewerVersion(game.version, '13');
        return isV13; 
    }

    static get v14() { 
        if (isV14 === undefined) isV14 = foundry.utils.isNewerVersion(game.version, '14');
        return isV14; 
    }

    static compatibleSystem(compatibleVersion){
        return foundry.utils.isNewerVersion(game.system.version, compatibleVersion);
    }

    static sceneConstructor() {
        if (CompatibilityHandler.v14) {
            Hooks.on('getHeaderControlsSceneConfig', (app, options) => {
                if (app.id.includes("SceneConfig-Scene")) {
                    options.push({
                        icon: "fas fa-tv",
                        label: Helpers.localize("LockViewHelp", "SceneConfig"),
                        visible: true,
                        action: "lockViewHelp"
                    })
                }
            })
        }
    }

    static sceneConfigHelpButton(element) {
        if (CompatibilityHandler.v14) return;
        const headerElmnt = document.createElement('li');
        element.querySelector(".controls-dropdown")?.appendChild(headerElmnt);
        headerElmnt.setAttribute('class', 'header-control');

        headerElmnt.innerHTML = `
        <button class="control" type="button">
            <i class="fas fa-tv"></i>
            <span class="control-label">${Helpers.localize("LockViewHelp", "SceneConfig")}</span>
        </button>
        `;

        headerElmnt.addEventListener('click', () => window.open(Helpers.getDocumentationUrl('sceneConfig/sceneConfig')))
    }

    /**
     * Make scene config tabs scrollable
     * Is hopefully not necessary in v15+: https://github.com/foundryvtt/foundryvtt/issues/14487
     */
    static makeAppTabsScrollable(element) {
        const nav = element.querySelector(".sheet-tabs");     
        const tabs = nav?.querySelectorAll("a");
        tabs?.forEach(tab => {
            tab.addEventListener("click", () => {
                //Smoothly scroll to tab position
                nav.scrollTo({
                    left: tab.offsetLeft - nav.offsetWidth/2 + tab.offsetWidth/2,
                    behavior: 'smooth'
                });
            })
        })
    }
}