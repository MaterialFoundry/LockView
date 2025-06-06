import { moduleName } from "../../lockview.js";
import { Helpers } from "../helpers.js";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class SceneConfigurator extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "lockView-sceneConfigurator",
        tag: "form",
        position: {
            width: 1000
        },
        window: {
            contentClasses: ["standard-form"],
            icon: "window-icon fa-fw fa-solid fa-map",
            controls: [
                {
                    icon: 'fas fa-circle-info',
                    label: "LOCKVIEW.Help",
                    action: "openDocumentation",
                },
              ]
        },
        actions: {
            openDocumentation: SceneConfigurator.openDocumentation,
            copy: SceneConfigurator.copyScene,
            paste: SceneConfigurator.pasteScene,
            reset: SceneConfigurator.resetScene
        }
    }

    static PARTS = {
        form: {
            template: "./modules/LockView/templates/sceneConfigurator.hbs",
            scrollable: [""]
          }
    }

    get title() {
        return "Lock View: " + Helpers.localize("SceneConfigurator.Title");
    }

    static openDocumentation(event, target) {
        window.open(Helpers.getDocumentationUrl('moduleSettings/sceneConfigurator/'))
    }

    static copyScene(event, target) {
        const sceneId = target.dataset.scene;
        const scene = sceneId === 'defaultSceneConfig' ? {name: Helpers.localize('Default', 'SceneConfigurator')} : game.scenes.get(sceneId);
        if (!scene) return ui.notifications.error("Lock View: " + Helpers.localize("CouldNotCopySceneConfig", "Notifications", {scene:scene.name}));
        this.copy = {
            flags: sceneId === 'defaultSceneConfig' ? game.settings.get(moduleName, 'defaultSceneConfig') : scene.flags.LockView,
            scene: sceneId,
            sceneName: scene.name
        }
        ui.notifications.info("Lock View: " + Helpers.localize("CopiedSceneConfig", "Notifications", {scene:scene.name}));
    }

    static async pasteScene(event, target) {
        if (!this.copy) return ui.notifications.warn("Lock View: " + Helpers.localize("NoCopiedSceneConfig", "Notifications"));
        const sceneId = target.dataset.scene;
        const scene = sceneId === 'defaultSceneConfig' ? {name: Helpers.localize('Default', 'SceneConfigurator')} : game.scenes.get(sceneId);
        if (sceneId === 'defaultSceneConfig') {
            await game.settings.set(moduleName, 'defaultSceneConfig', this.copy.flags);
        }
        else {
            if (!scene) return ui.notifications.error("Lock View: " + Helpers.localize("CouldNotCopySceneConfig", "Notifications", {scene:scene.name}));

            await scene.update({
                flags: {
                    LockView: this.copy.flags
                }
            })
            
            lockView.sceneHandler.onSceneLoad(scene);
            lockView.socket.sceneUpdated({scene: sceneId})
        }

        ui.notifications.info("Lock View: " + Helpers.localize("PastedSceneConfig", "Notifications", {origin:this.copy.sceneName, target:scene.name}));
        this.render(true);
    }

    static async resetScene(event, target) {
        const sceneId = target.dataset.scene;
        if (sceneId === 'defaultSceneConfig') return;
        const scene = game.scenes.get(sceneId);
        if (!scene) return ui.notifications.error("Lock View: " + Helpers.localize("CouldNotResetSceneConfig", "Notifications", {scene:scene.name}));

        await scene.update({
            flags: {
                LockView: game.settings.get(moduleName, 'defaultSceneConfig')
            }
        })
        
        lockView.sceneHandler.onSceneLoad(scene);
        lockView.socket.sceneUpdated({scene: sceneId})
        
        ui.notifications.info("Lock View: " + Helpers.localize("ResetSceneConfig", "Notifications", {scene:scene.name}));
        this.render(true);
    }

    //Prepare data to be handled
    async _prepareContext(options) {
        let scenes = [];
        for (let scene of game.scenes) {
            scenes.push({
                id: scene.id,
                name: scene.name,
                settings: lockView.sceneHandler.getSceneConfig(scene.flags.LockView)
            })
        }
        scenes.push({
            id: 'defaultSceneConfig',
            default: true,
            name: Helpers.localize('Default', 'SceneConfigurator'),
            settings: lockView.sceneHandler.getSceneConfig(game.settings.get(moduleName, 'defaultSceneConfig'))
        })

        return {
            scenes
        }
    }

    _onRender(context, options) {
        this.copy = undefined;

        const hTop = this.element.querySelector('header[name="headerTop"]').offsetHeight;
        const hBottom = this.element.querySelector('header[name="headerBottom"]').offsetHeight;
        const hLi = this.element.querySelector('li[class="sceneConfigurator-line form-group"]').offsetHeight;

        for (let line of this.element.querySelectorAll('div[class="vl-top"]'))
            line.style.minHeight = hTop + 'px';
        
       for (let line of this.element.querySelectorAll('div[class="vl-bottom"]'))
            line.style.minHeight = hBottom + 'px';
       
        for (let line of this.element.querySelectorAll('div[class="vl-li"]'))
            line.style.minHeight = hLi + 'px';
        
        const updateFlags = async (sceneId, key, value) => {
            if (sceneId === 'defaultSceneConfig') {
                let defaultSceneConfig = game.settings.get(moduleName, 'defaultSceneConfig');
                Helpers.setNestedObjectValue(key, defaultSceneConfig, value);
                game.settings.set(moduleName, 'defaultSceneConfig', defaultSceneConfig);
            }
            else {
                const scene = game.scenes.get(sceneId); 
                if (!scene) return;
                let flags = scene.flags.LockView;
                Helpers.setNestedObjectValue(key, flags, value);
                await scene.update({
                    flags: {
                        LockView: flags
                    }
                })
                lockView.sceneHandler.onSceneLoad(scene);
                lockView.socket.sceneUpdated({scene: sceneId})
            }
        }

        const inputElements = this.element.querySelectorAll('input');
        for (let elmnt of inputElements) {
            elmnt.addEventListener('change', async (ev) => {
                updateFlags(elmnt.dataset.scene, elmnt.dataset.action, ev.target.checked);
            })
        }
        const selectElements = this.element.querySelectorAll('select');
        for (let elmnt of selectElements) {
            elmnt.addEventListener('change', async (ev) => {
                updateFlags(elmnt.dataset.scene, elmnt.dataset.action, ev.target.value);
            })
        }
    }
}