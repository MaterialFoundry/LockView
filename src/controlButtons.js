import { moduleName } from "../lockview.js";
import { Helpers } from "./helpers.js";

export function initializeControlButtons() {
    Hooks.on('getSceneControlButtons', controls => {
        controls.lockView = {
            name: "lockView",
            title: "Lock View",
            icon: "fas fa-tv",
            activeTool: "dummy",
            tools: {
                dummy: {
                    //Dummy tool because Foundry does not like it when there's no valid 'active' tool available, it's hidden on the 'renderSceneControls' hook. https://github.com/foundryvtt/foundryvtt/issues/12966
                    name: "dummy",
                    visible: true,
                    order: 9
                },
                setView: {
                    name: "setView",
                    title: game.i18n.localize("LOCKVIEW.ControlButtons.SetView"),
                    icon: "fas fa-compress-arrows-alt",
                    visible: true,
                    button: true,
                    order: 0,
                    onChange: () => lockView.apps.setView.render(true)
                },
                cloneView: {
                    name: "cloneView",
                    title: game.i18n.localize("LOCKVIEW.ControlButtons.CloneView"),
                    icon: "fas fa-clone",
                    visible: true,
                    button: true,
                    order: 1,
                    onChange: () => lockView.apps.cloneView.apply()
                },
                resetView: {
                    name: "resetView",
                    title: game.i18n.localize("LOCKVIEW.ControlButtons.ResetView"),
                    icon: "fas fa-rotate-left",
                    visible: true,
                    button: true,
                    order: 1,
                    onChange: () => {
                        let users = [];
                        game.users.forEach((u) => {
                            if (Helpers.getUserSetting('enable', u.id)) 
                                lockView.socket.refresh();
                        })
                    }
                },
                panLock: {
                    name: "panLock",
                    title: game.i18n.localize("LOCKVIEW.ControlButtons.PanLock"),
                    icon: "fas fa-arrows-alt",
                    visible: true,
                    order: 2,
                    onChange: (event, active) => {
                        lockView.locks.update({pan: active}, {save: true})
                    },
                    toggle: true,
                    active: lockView?.locks?.pan || false
                },
                zoomLock: {
                    name: "zoomLock",
                    title: game.i18n.localize("LOCKVIEW.ControlButtons.ZoomLock"),
                    icon: "fas fa-search-plus",
                    visible: true,
                    order: 3,
                    onChange: (event, active) => {
                        lockView.locks.update({zoom: active}, {save: true})
                    },
                    toggle: true,
                    active: lockView?.locks?.zoom || false
                },
                boundingBox: {
                    name: "boundingBox",
                    title: game.i18n.localize("LOCKVIEW.ControlButtons.BoundingBox"),
                    icon: "fas fa-box",
                    visible: true,
                    order: 4,
                    onChange: (event, active) => {
                        lockView.locks.update({boundingBox: active}, {save: true})
                    },
                    toggle: true,
                    active: lockView?.locks?.boundingBox || false
                },
                viewbox: {
                    name: "viewbox",
                    title: game.i18n.localize("LOCKVIEW.ControlButtons.Viewbox"),
                    icon: "far fa-square",
                    visible: true,
                    order: 5,
                    onChange: async (event, active) => {
                        lockView.viewbox.enable(active);
                        if (!active) {
                            lockView.viewbox.enableEdit(false);
                            ui.controls.controls.lockView.tools.editViewbox.active = false;
                            ui.controls.render();
                        }
                    },
                    toggle: true,
                    active: lockView.viewbox.enabled
                },
                editViewbox: {
                    name: "editViewbox",
                    title: game.i18n.localize("LOCKVIEW.ControlButtons.EditViewbox"),
                    icon: "fas fa-vector-square",
                    visible: true,
                    order: 6,
                    onChange: (event, active) => {
                        if (active && !lockView.viewbox.enabled) {
                            lockView.viewbox.enable(true);
                            ui.controls.controls.lockView.tools.viewbox.active = true;
                            ui.controls.render();
                        }
                        lockView.viewbox.enableEdit(active);
                    },
                    toggle: true,
                    active: lockView.viewbox.editEnabled
                },
            },
        }
    });

    Hooks.on('renderSceneControls', () => {
        const visibleControlButtons = game.settings.get(moduleName, "controlButtons");
        
        if (!visibleControlButtons.enable || !Helpers.getUserSetting('control')) {
            document.querySelector('button[data-control="lockView"]').parentElement.style.display = 'none';
            if (ui.controls.control.name === "lockView")
                ui.controls.activate({control: "tokens"}) 
            return;
        }
        if (ui.controls.control.name !== 'lockView') {
            lockView.viewbox.enableEdit(false);
            ui.controls.controls.lockView.tools.editViewbox.active = false;
        }
        else {
            const toolElements = document.getElementById("scene-controls-tools");
            //hide dummy tool
            toolElements.querySelector('button[data-tool="dummy"]').parentElement.style.display = 'none';
            
            Object.entries(visibleControlButtons).forEach(([id, value]) => {
                if (!value) toolElements.querySelector(`button[data-tool="${id}"]`).parentElement.style.display = 'none';
            })
        }

        document.querySelector('button[data-tool="cloneView"]')?.addEventListener('contextmenu', (ev) => {
            lockView.apps.cloneView.render(true);
        })
    })
}