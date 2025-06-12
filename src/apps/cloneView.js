import { Helpers } from "../helpers.js";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

function localize(str, category="CloneView") {
    return Helpers.localize(str, category)
}

export class CloneView extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "lockView-cloneView",
        tag: "div",
        position: {
            width: 300
        },
        window: {
            contentClasses: ["standard-form"],
            icon: "fas fa-clone",
            controls: [
                {
                    icon: 'fas fa-circle-info',
                    label: "LOCKVIEW.Help",
                    action: "openDocumentation",
                },
              ]
        },
        actions: {
            openDocumentation: CloneView.openDocumentation
        }
    }

    static PARTS = {
        form: {
            template: "./modules/LockView/templates/cloneView.hbs",
            scrollable: [""]
          }
    }

    get title() {
        return "Lock View: " + localize("Title");
    }

    static openDocumentation() {
        window.open(Helpers.getDocumentationUrl(''))
    }

    pan = true;
    zoom = true;
    users = {};
    showDialog = true;

    async apply(pan = this.pan, zoom = this.zoom, users) {
        if (!Helpers.getUserSetting('control')) 
            return ui.notifications.warn("Lock View: " + Helpers.localize("NoPermission", "Notifications"));
        if (!users) {
            users = {};
            for (let user of game.users) {
                if (user._id === game.userId) continue;
                if (user.viewedScene !== canvas.scene.id) continue;
                if (this.users[user._id] !== undefined)
                    users[user._id] = this.users[user._id];
                else {
                    users[user._id] = Helpers.getUserSetting('enable', user._id);
                }
            }
        }

        if (this.showDialog && (pan && lockView.locks.pan || zoom && lockView.locks.zoom)) {
            const fields = foundry.applications.fields;
            const cb = fields.createCheckboxInput({
                name: 'doNotShowAgain',
                value: false
            })
            
            const formGroup = fields.createFormGroup({
                input: cb,
                label: localize("DoNotShowAgain")
            })

            let showDialog = true;
            const dialog = await foundry.applications.api.DialogV2.confirm({
                window: { title: localize("Title") },
                content: `<p>${localize("DialogContent")}</p>${formGroup.outerHTML}`,
                render: (context, options) => {
                    options.element.querySelector('input[name="doNotShowAgain"]').addEventListener('change', (ev) => showDialog = !ev.target.checked);
                }
            })

            this.showDialog = showDialog;
            if (!dialog) return;
        }
        
        let u = [];
        Object.entries(users).forEach(([id, val]) => {
            if (val) u.push(id);
        })

        lockView.socket.setViewDialog({
            pan: pan ? 'cloneView' : 'noChange',
            coordinates: {
                x: canvas.scene._viewPosition.x,
                y: canvas.scene._viewPosition.y
            },
            zoom: zoom ? 'cloneView' : undefined,
            scale: canvas.scene._viewPosition.scale
        }, u)
    }

    //Prepare data to be handled
    async _prepareContext(options) {

        let users = [];
        for (let user of game.users) {
            if (user._id === game.userId) continue;
            if (user.viewedScene !== canvas.scene.id) continue;
            let initial;
            if (this.users[user._id] !== undefined)
                initial = this.users[user._id];
            else {
                initial = Helpers.getUserSetting('enable', user._id);
                this.users[user._id] = initial;
            }
            users.push(new foundry.data.fields.BooleanField({label: user.name, initial}, {name: `users.${user._id}`}))
        }

        return {
            pan: new foundry.data.fields.BooleanField({label: localize('Pan'), initial: this.pan}, {name: 'pan'}),
            zoom: new foundry.data.fields.BooleanField({label: localize('Zoom'), initial: this.zoom}, {name: 'zoom'}),
            users
        }
    }

    _onRender(context, options) {
        this.element.querySelector('input[name="pan"]').addEventListener('change', (ev) => this.pan = ev.target.checked);
        this.element.querySelector('input[name="zoom"]').addEventListener('change', (ev) => this.zoom = ev.target.checked);
        Object.entries(this.users).forEach(([id, val]) => {
            this.element.querySelector(`input[name="users.${id}"]`).addEventListener('change', (ev) => this.users[id] = ev.target.checked);
        })
    }
}