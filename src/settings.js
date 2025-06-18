import { moduleName, documentationUrl } from "../lockview.js";
import { Helpers } from "./helpers.js";

function localize(str, category="Settings") {
    return Helpers.localize(str, category)
}

export function registerSettings() {

    //Enable right-click dragging for the viewbox
    game.settings.register(moduleName, "mouserViewboxControl", {
        name: "LOCKVIEW.Settings.MouseViewboxControl",
        hint: "LOCKVIEW.Settings.MouseViewboxControl_Hint",
        scope: "user",
        config: true,
        default: true,
        type: Boolean
    });

    //Sets which control buttons are visible
    game.settings.register(moduleName, "controlButtons", {
        scope: "user",
        config: false,
        default: {
            enable: true,
            setView: true,
            cloneView: true,
            resetView: true,
            panLock: true,
            zoomLock: true,
            boundingBox: true,
            viewbox: true,
            editViewbox: true
        },
        type: Object,
        onChange: x => {}
    });

    //Sets what to do if the 'control' user pans the canvas using a ping
    game.settings.register(moduleName, "pingPan", {
        name: "LOCKVIEW.Settings.PingPan.Label",
        hint: "LOCKVIEW.Settings.PingPan.Hint",
        scope: "world",
        config: true,
        default: "block",
        type: String,
        choices: {
            "block": "LOCKVIEW.Settings.PingPan.Block",
            "panOnly": "LOCKVIEW.Settings.PingPan.PanOnly",
            "zoomOnly": "LOCKVIEW.Settings.PingPan.ZoomOnly",
            "any": "LOCKVIEW.Settings.PingPan.Any"
        }
    });

    //Display Width
    game.settings.register(moduleName, "DisplayWidth", {
        name: "LOCKVIEW.Settings.DisplayWidth",
        scope: "user",
        config: true,
        default: 930,
        type: Number,
        onChange: async (val) => {
            if (game.user.isGM) {
                let s = game.settings.get(moduleName, "GmGridsizeData");
                s.displayWidth = val;
                await game.settings.set(moduleName, "GmGridsizeData", s);
            }
            lockView.sceneHandler.calculatePhysicalGridsize(true);
        }
    });

    //Physical Gridsize
    game.settings.register(moduleName, "Gridsize", {
        name: "LOCKVIEW.Settings.Gridsize",
        scope: "user",
        config: true,
        default: 25,
        type: Number,
        onChange: async (val) => {
            if (game.user.isGM) {
                let s = game.settings.get(moduleName, "GmGridsizeData");
                s.gridSize = val;
                await game.settings.set(moduleName, "GmGridsizeData", s);
            }
            lockView.sceneHandler.calculatePhysicalGridsize(true);
        }
    });

    //Hidden setting to store the GM's grid size data so it can be applied to users if 'GmGridsize' is enabled
    game.settings.register(moduleName, "GmGridsizeData", {
        name: "LOCKVIEW.Settings.Gridsize",
        scope: "world",
        config: false,
        default: {
            displayWidth: 930,
            gridSize: 25
        },
        type: Object,
        onChange: async (val) => {
            if (!game.user.isGM && game.settings.get(moduleName, "GmGridsize")) {
                if (val.displayWidth) await game.settings.set(moduleName, "DisplayWidth", val.displayWidth)
                if (val.gridSize) await game.settings.set(moduleName, "Gridsize", val.gridSize)
                lockView.sceneHandler.calculatePhysicalGridsize(true);
            }   
        }
    });

    //Apply GM Physical grid size
    game.settings.register(moduleName, "GmGridsize", {
        name: "LOCKVIEW.Settings.GmGridsize",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
        onChange: async (val, b, c) => {
            if (!val) return;
            if (game.user.isGM) {
                await game.settings.set(moduleName, "GmGridsizeData", {
                    displayWidth: game.settings.get(moduleName, "DisplayWidth"),
                    gridSize: game.settings.get(moduleName, "Gridsize")
                });
            }
        }
    });

    //Stores the user settings
    game.settings.register(moduleName, 'userSettings', {
        name: "userSettings",
        scope: "world",
        type: Object,
        default: [],
        config: false
    });

    //Stores the default user settings
    game.settings.register(moduleName, 'defaultUserSettings', {
        name: "defaultUserSettings",
        scope: "world",
        type: Object,
        default: {
            enable: true,
            viewbox: true,
            static: false,
            control: false
        },
        config: false
    })

    //Stores the default scene config
    game.settings.register(moduleName, 'defaultSceneConfig', {
        name: "defaultSceneConfig",
        scope: "world",
        type: Object,
        default: {},
        config: false
    })

    //Hide the visibility of the viewbox
    game.settings.register(moduleName, "viewboxEnable", {
        scope: "user",
        config: false,
        default: false,
        type: Boolean
    });

    //Register keybinding to show or hide the UI elements
    game.keybindings.register("LockView", "showHideUI", {
        name: "LOCKVIEW.Settings.ShowHideUI",
        hint: "LOCKVIEW.Settings.ShowHideUI_Hint",
        editable: [
            {key: "KeyU", modifiers: [foundry.helpers.interaction.KeyboardManager.MODIFIER_KEYS.ALT]}
        ],
        onDown: () => { lockView.sceneHandler.forceShowUi() },
        precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
    });

    //Register keybinding to cycle through the active viewbox
    game.keybindings.register("LockView", "cycleViewboxes", {
        name: "LOCKVIEW.Settings.CycleViewboxes",
        hint: "LOCKVIEW.Settings.CycleViewboxes_Hint",
        editable: [
            {key: "Tab"}
        ],
        onDown: () => { lockView.viewbox.cycleViewboxes() },
        precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
    });

    //Register keybinding to clone the view
    game.keybindings.register("LockView", "cloneView", {
        name: "LOCKVIEW.Settings.CloneView",
        hint: "LOCKVIEW.Settings.CloneView_Hint",
        editable: [
            {key: "KeyC", modifiers: [foundry.helpers.interaction.KeyboardManager.MODIFIER_KEYS.ALT]}
        ],
        onDown: () => { lockView.apps.cloneView.apply() },
        precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
    });

    /**
     * Configure the Lock View module settings:
     * -Add buttons
     * -Move 'Physical Grid Size' settings into a field
     */
    Hooks.on('renderSettingsConfig', (app, elmnt) => {
        const gmGridSize = game.settings.get(moduleName, "GmGridsize");
        const displayWidthElmnt = elmnt.querySelector("input[name='LockView.DisplayWidth']");
        const gridSizeElmnt = elmnt.querySelector("input[name='LockView.Gridsize']");

        const fieldset = document.createElement('fieldset');

        const legend = document.createElement("legend");
        legend.innerHTML = localize("PhysicalGridSize");
        fieldset.appendChild(legend);

        const description = document.createElement("p");
        description.setAttribute("class", "hint");
        description.innerHTML = localize("PhysicalGridSize_Hint") + '<br><br>' + localize("PhysicalGridSize_Hint2");
        fieldset.appendChild(description);

        fieldset.appendChild(displayWidthElmnt.parentElement.parentElement);
        fieldset.appendChild(gridSizeElmnt.parentElement.parentElement);
        if (game.user.isGM) {
            fieldset.appendChild(elmnt.querySelector("input[name='LockView.GmGridsize']").parentElement.parentElement);
        }
        else {
            const dummySetting = document.createElement('div');
            dummySetting.setAttribute("class", "form-group");
            dummySetting.innerHTML = `
            <label>${localize("GmGridsize")}</label>
            <div class="form-fields">
                <input type="checkbox" disabled ${gmGridSize ? 'checked' : ''}></input>
            </div>
            `
            fieldset.appendChild(dummySetting);

            if (gmGridSize) {
                setTimeout(()=> {
                    displayWidthElmnt.disabled = true;
                    gridSizeElmnt.disabled = true;
                }, 500);
                
            }
        }

        document.querySelector(`[data-category="LockView"]`).appendChild(fieldset)

        const lvSettings = document.querySelector(`[data-category="LockView"]`).getElementsByClassName('form-group')[0] 

        //Documentation button
        lvSettings.before(createSettingsButton(localize("Documentation"), "fas fa-circle-question", localize("Documentation_Hint"), ()=> open(documentationUrl)));

        //User Config and Scene Configurator buttons
        if (game.user.isGM) {
            lvSettings.before(createSettingsButton(localize("Title", "UserConfig"), "fas fa-users", localize("Hint", "UserConfig"), ()=> lockView.apps.userConfig.render(true)));
            lvSettings.before(createSettingsButton(localize("Title", "SceneConfigurator"), "window-icon fa-fw fa-solid fa-map", localize("Hint", "SceneConfigurator"), ()=> lockView.apps.sceneConfigurator.render(true)));
        }

        if (game.user.isGM || Helpers.getUserSetting('control')) {
            lvSettings.before(createSettingsButton(localize("ButtonTitle", "CloneView"), "fas fa-clone", localize("ButtonHint", "CloneView"), ()=> lockView.apps.cloneView.render(true)));
            lvSettings.before(createSettingsButton(localize("ControlButtonsConfig", "ControlButtons"), "fas fa-eye", localize("ControlButtonsConfig_ButtonHint", "ControlButtons"), ()=> lockView.apps.controlButtonsConfig.render(true)));
        }
        
    })
}

/**
 * Create a settings button element to be displayed in the module settings
 */
function createSettingsButton(label, icon, hint, callback) {
    const formGroup = document.createElement("div");
    formGroup.setAttribute("class", "form-group");

    const labelElmnt = document.createElement("label");
    labelElmnt.innerHTML = label;
    formGroup.appendChild(labelElmnt);

    const formFields = document.createElement("div");
    formFields.setAttribute("class", "form-fields");
    formGroup.appendChild(formFields);

    const button = document.createElement("button");
    button.setAttribute("type", "button");
    button.addEventListener('click', callback);
    formFields.appendChild(button);

    const buttonIcon = document.createElement("i");
    buttonIcon.setAttribute("class", icon);
    button.appendChild(buttonIcon);

    const buttonText = document.createElement("span");
    buttonText.innerHTML = label;
    button.appendChild(buttonText);

    const hintElmnt = document.createElement("p");
    hintElmnt.setAttribute("class", "hint");
    hintElmnt.innerHTML = hint;

    formGroup.appendChild(hintElmnt);

    return formGroup;
}