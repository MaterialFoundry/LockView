export function initializeControlButtons() {
    Hooks.on('getSceneControlButtons', controls => {
        if (!lockView?.controlButtonVisible) return;

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
                panLock: {
                    name: "panLock",
                    title: game.i18n.localize("LOCKVIEW.ControlButtons.PanLock"),
                    icon: "fas fa-arrows-alt",
                    visible: true,
                    order: 1,
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
                    order: 2,
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
                    order: 3,
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
                    order: 4,
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
                    order: 5,
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
        if (!lockView?.controlButtonVisible) return;
        if (ui.controls.control.name !== 'lockView') {
            lockView.viewbox.enableEdit(false);
            ui.controls.controls.lockView.tools.editViewbox.active = false;
        }
        else {
            //hide dummy tool
            document.querySelector('button[data-tool="dummy"]').parentElement.style.display = 'none' 
        }
    })
}