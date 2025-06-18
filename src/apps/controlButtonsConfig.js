import { moduleName } from "../../lockview.js";
import { Helpers } from "../helpers.js";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class ControlButtonsConfig extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "lockView-controlButtonsConfig",
        tag: "form",
        position: {
            width: 300
        },
        form: {
            closeOnSubmit: true,
            handler: ControlButtonsConfig.#onSubmit
        },
        window: {
            contentClasses: ["standard-form"],
            icon: "fas fa-eye",
            controls: [
                {
                    icon: 'fas fa-circle-info',
                    label: "LOCKVIEW.Help",
                    action: "openDocumentation",
                },
              ]
        },
        actions: {
            openDocumentation: ControlButtonsConfig.openDocumentation,
        }
    }

    static PARTS = {
        form: {
            template: "./modules/LockView/templates/controlButtonsConfig.hbs",
            scrollable: [""]
          }
    }

    get title() {
        return "Lock View: " + Helpers.localize("ControlButtons.ControlButtonsConfig");
    }

    static openDocumentation(event, target) {
        window.open(Helpers.getDocumentationUrl('moduleSettings/controlButtonsConfigurator/'))
    }

    //Prepare data to be handled
    async _prepareContext(options) {
        const visibleControlButtons = game.settings.get(moduleName, "controlButtons");
        let controlButtons = [];
        Object.entries(visibleControlButtons).forEach(([id, value]) => {
            const tool = id === 'enable' 
                ? {title: Helpers.localize("ControlButtons.EnableControlButtons"), icon: "fas fa-eye"} 
                : ui.controls.controls.lockView.tools[id]
            
            controlButtons.push({
                id,
                value,
                label: tool.title,
                icon: tool.icon
            })
        })
        return {
            controlButtons
        }
    }

    static async #onSubmit(event, form, formData) {
        const data = foundry.utils.expandObject(formData.object);
        await game.settings.set(moduleName, "controlButtons", data);
        lockView.controlButtonVisible = Helpers.getUserSetting('control') && data.enable;
        ui.controls.render();
    }
}