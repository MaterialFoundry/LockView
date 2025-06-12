import { moduleName } from "../../lockview.js";
import { Helpers } from "../helpers.js";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

let setViewSettings = {
    pan: "noChange",
    grid: {
        x: undefined,
        y: undefined
    },
    coordinates: {
        x: undefined,
        y: undefined
    },
    zoom: "noChange",
    scale: undefined,
    users: {}
}

export class SetViewDialog extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "lockView-setView",
        tag: "form",
        position: {
            width: 400
        },
        form: {
            handler: SetViewDialog.#onSubmit
        },
        window: {
            contentClasses: ["standard-form"],
            icon: "fas fa-compress-arrows-alt",
            controls: [
                {
                    icon: 'fas fa-circle-info',
                    label: "LOCKVIEW.Help",
                    action: "openDocumentation",
                },
              ]
        },
        actions: {
            openDocumentation: SetViewDialog.openDocumentation,
        }
    }

    static PARTS = {
        form: {
            template: "./modules/LockView/templates/setViewDialog.hbs",
            scrollable: [""]
          }
    }

    get title() {
        return "Lock View: " + Helpers.localize("SetView.Title");
    }

    static openDocumentation(event, target) {
        window.open(Helpers.getDocumentationUrl('controlButtons#SetView/'))
    }

    //Prepare data to be handled
    async _prepareContext(options) {
        const uSettings = game.settings.get(moduleName, 'userSettings');
        const defaultUserSettings = game.settings.get(moduleName, 'defaultUserSettings');
        let userSettings = [];
        for (let userData of game.users) {
            if (!userData.active) continue;
            let s = uSettings.find(s => s.id === userData.id);
            if (!s && (userData.role === 3 || userData.role === 4)) s = {enable: false, viewbox: false, control: true} ;
            else if (!s) s = defaultUserSettings;

            let enable;
            if (setViewSettings.users[userData.id] !== undefined) enable = setViewSettings.users[userData.id];
            else enable = userData.id === game.userId ? false : s.enable

            userSettings.push({
                name: userData.name,
                id: userData.id,
                enable
            })
        }

        return {
            userSettings,
            config: setViewSettings
        }
    }

    _onRender(context, options) {
        const gridSpaceElmnt = this.element.querySelector('div[name="gridSpacesSection"]');
        const coordinatesElmnt = this.element.querySelector('div[name="coordinatesSection"]');
        const zoomModeElmnt = this.element.querySelector('div[name="zoomModeSection"]');
        const scaleElmnt = this.element.querySelector('div[name="scaleSection"]');

        const onPanModeChange = (mode) => {
            if (!mode) return;
            setViewSettings.pan = mode;
            gridSpaceElmnt.style.display = mode === 'moveGridSpaces' ? '' : 'none';
            coordinatesElmnt.style.display = mode === 'moveByCoords' || mode === 'moveToCoords' ? '' : 'none';
            zoomModeElmnt.style.display = (mode === 'noChange' || mode === 'initialView' || mode === 'moveGridSpaces' || mode === 'moveByCoords' || mode === 'moveToCoords' || mode === 'cloneView') ? '' : 'none';
        }

        const onZoomModeChange = (mode) => {
            if (!mode) return;
            setViewSettings.zoom = mode;
            scaleElmnt.style.display = mode === 'set' ? '' : 'none';
        }

        this.element.querySelector('select[name="pan"]').addEventListener('change', (ev) => onPanModeChange(ev.target.value) );
        this.element.querySelector('select[name="zoom"]').addEventListener('change', (ev) => onZoomModeChange(ev.target.value) );
        this.element.querySelector('input[name="grid.x"]').addEventListener('change', (ev) => setViewSettings.grid.x = ev.target.value );
        this.element.querySelector('input[name="grid.y"]').addEventListener('change', (ev) => setViewSettings.grid.y = ev.target.value );
        this.element.querySelector('input[name="grid.x"]').addEventListener('change', (ev) => setViewSettings.grid.x = ev.target.value );
        this.element.querySelector('input[name="grid.y"]').addEventListener('change', (ev) => setViewSettings.grid.y = ev.target.value );
        this.element.querySelector('input[name="scale"]').addEventListener('change', (ev) => setViewSettings.scale = ev.target.value );

        document.querySelectorAll('input[name^="users"]').forEach(elmnt => elmnt.addEventListener('change', (ev) => setViewSettings.users[elmnt.name.replace('users.', '')] = ev.target.checked )) 
        
        this.element.querySelector('select[name="pan"]').value = setViewSettings.pan;
        onPanModeChange(setViewSettings.pan);
        this.element.querySelector('select[name="zoom"]').value = setViewSettings.zoom;
        onZoomModeChange(setViewSettings.zoom);
    }

    static async #onSubmit(event, form, formData) {
        if (!Helpers.getUserSetting('control')) return ui.notifications.warn("Lock View: " + Helpers.localize("NoPermission", "Notifications"));
        const data = foundry.utils.expandObject(formData.object);
        if (data.pan === 'noChange' && data.zoom === 'noChange') return;

        let users = [];
        Object.entries(data.users).forEach(([key, val]) => {if(val) users.push(key)});
        if (users.length === 0)
            return ui.notifications.warn("Lock View: " + Helpers.localize("NoUsersSelected", "Notifications"));

        setViewSettings = {
            pan: data.pan,
            coordinates: data.coordinates,
            grid: data.grid,
            zoom: data.zoom,
            scale: data.scale
        }

        lockView.socket.setViewDialog(setViewSettings, users);

        setViewSettings.users = data.users;
    }
}