import { moduleName } from "../../lockview.js";
import { Helpers } from "../helpers.js";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class UserConfig extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "lockView-userConfig",
        tag: "form",
        position: {
            width: 660
        },
        form: {
            closeOnSubmit: true,
            handler: UserConfig.#onSubmit
        },
        window: {
            contentClasses: ["standard-form"],
            icon: "fa-solid fa-users",
            controls: [
                {
                    icon: 'fas fa-circle-info',
                    label: "LOCKVIEW.Help",
                    action: "openDocumentation",
                },
              ]
        },
        actions: {
            openDocumentation: UserConfig.openDocumentation,
        }
    }

    static PARTS = {
        form: {
            template: "./modules/LockView/templates/userConfig.hbs",
            scrollable: [""]
          }
    }

    get title() {
        return "Lock View: " + Helpers.localize("UserConfig.Title");
    }

    static openDocumentation(event, target) {
        window.open(Helpers.getDocumentationUrl('moduleSettings/userConfig/'))
    }


    //Prepare data to be handled
    async _prepareContext(options) {

        const uSettings = game.settings.get(moduleName, 'userSettings');
        const defaultUserSettings = game.settings.get(moduleName, 'defaultUserSettings');
        let userSettings = [];
        for (let userData of game.users) {
            let role;
            if (userData.role == 0) role = game.i18n.localize("USER.RoleNone");
            else if (userData.role == 1) role = game.i18n.localize("USER.RolePlayer");
            else if (userData.role == 2) role = game.i18n.localize("USER.RoleTrusted");
            else if (userData.role == 3) role = game.i18n.localize("USER.RoleAssistant");
            else if (userData.role == 4) role = game.i18n.localize("USER.RoleGamemaster");

            let s = uSettings.find(s => s.id === userData.id);
            if (!s && (userData.role === 3 || userData.role === 4)) s = {enable: false, viewbox: false, control: true} ;
            else if (!s) s = defaultUserSettings;

            userSettings.push({
                name: userData.name,
                role,
                id: userData.id,
                enable: s.enable,
                viewbox: s.viewbox,
                static: s.static,
                control: s.control
            })
        }

        return {
            userSettings,
            defaultUserSettings
        }
    }

    static async #onSubmit(event, form, formData) {
        const data = foundry.utils.expandObject(formData.object);
        let userData = [];
        for (let [key, value] of Object.entries(data.user)) {
            userData.push({
                id: key,
                ...value
            })
        }
        
        await game.settings.set(moduleName, 'userSettings', userData);
        await game.settings.set(moduleName, 'defaultUserSettings', data.default);
        lockView.userSettings = userData.find(s => s.id === game.userId);
        lockView.refresh();
    }
}