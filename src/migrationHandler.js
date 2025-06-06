import { moduleName } from "../lockview.js";

export class migrationHandler {

    constructor() {
        Hooks.once('ready', async() => {
            if (game.user.isGM) {
                const defaultConfig = this.migrateFlags(game.settings.get(moduleName, 'defaultSceneConfig'), lockView.sceneHandler.defaultSceneConfig);
                if (defaultConfig) await game.settings.set(moduleName, 'defaultSceneConfig', defaultConfig);
                this.migrateAll();
            }
        })
    }

    migrateAll() {
        game.scenes.forEach((scene) => {
            this.migrateScene(scene);
        })

    }

    migrateScene(scene) {
        const flags = this.migrateFlags(scene.flags.LockView);
        if (!flags) return;
        console.log(`Lock View: Configuring/migrating scene flags for scene "${scene.name}"`)
        scene.update({
            flags: {
                LockView: flags
            }
        })
    }

    migrateFlags(flags, defaultConfig=game.settings.get(moduleName, 'defaultSceneConfig')) {
        if (!flags) return defaultConfig;

        if (!flags.locks) {
            let autoScaleFlag;
            if (flags.autoScale == 0) autoScaleFlag = 'off';
            else if (flags.autoScale == 1) autoScaleFlag = 'horizontal';
            else if (flags.autoScale == 2) autoScaleFlag = 'vertical';
            else if (flags.autoScale == 3) autoScaleFlag = 'autoInside';
            else if (flags.autoScale == 4) autoScaleFlag = 'autoOutside';
            else if (flags.autoScale == 5) autoScaleFlag = 'physical';

            let sidebarFlag = flags.sidebar;
            if (typeof sidebarFlag === 'object') sidebarFlag = undefined;

            const allUiFlags = flags.hideUIelements?.controls && flags.hideUIelements?.hotbar && flags.hideUIelements?.navigation && flags.hideUIelements?.players && flags.hideUIelements?.sidebar;
            
            return {
                locks: {
                    pan: flags.lockPanInit || defaultConfig.locks.pan,
                    zoom: flags.lockZoomInit || defaultConfig.locks.zoom,
                    boundingBox: flags.boundingBoxInit || defaultConfig.locks.boundingBox
                },
                ui: {
                    hideOn: flags.hideUI ? 'sidebar' : defaultConfig.ui.hideOn,
                    'scene-controls': flags.hideUIelements?.controls || defaultConfig.ui['scene-controls'],
                    hotbar: flags.hideUIelements?.hotbar || defaultConfig.ui.hotbar,
                    'scene-navigation': flags.hideUIelements?.navigation || defaultConfig.ui['scene-navigation'],
                    players: flags.hideUIelements?.players || defaultConfig.ui.players,
                    sidebar: flags.hideUIelements?.sidebar || defaultConfig.ui.sidebar,
                    'chat-notifications': allUiFlags || defaultConfig.ui['chat-notifications'],
                    'camera-views': allUiFlags || defaultConfig.ui['camera-views']
                },
                sidebar: {
                    sceneLoad: sidebarFlag || defaultConfig.sidebar.sceneLoad,
                    exclude: flags.excludeSidebar || defaultConfig.sidebar.exclude,
                    blacken: flags.blackenSidebar || defaultConfig.sidebar.blacken
                },
                autoscale: autoScaleFlag || defaultConfig.autoscale,
                forceInitialView: flags.forceInit || defaultConfig.forceInitialView
            }
        }
        return false;
    }

    async cleanFlags(scene) {
        if (typeof scene === 'string') {
            scene = game.scenes.get(scene);
        }
        if (!scene) console.warn('Lock View: Invalid Scene');

        await scene.unsetFlag(moduleName, 'autoScale');
        await scene.unsetFlag(moduleName, 'blackenSidebar');
        await scene.unsetFlag(moduleName, 'boundingBox');
        await scene.unsetFlag(moduleName, 'boundingBoxInit');
        await scene.unsetFlag(moduleName, 'collapseSidebar');
        await scene.unsetFlag(moduleName, 'editViewbox');
        await scene.unsetFlag(moduleName, 'excludeSidebar');
        await scene.unsetFlag(moduleName, 'forceInit');
        await scene.unsetFlag(moduleName, 'hideUI');
        await scene.unsetFlag(moduleName, 'hideUIelements');
        await scene.unsetFlag(moduleName, 'lockPan');
        await scene.unsetFlag(moduleName, 'lockPanInit');
        await scene.unsetFlag(moduleName, 'lockZoom');
        await scene.unsetFlag(moduleName, 'lockZoomInit');
        await scene.unsetFlag(moduleName, 'rotation');
        await scene.unsetFlag(moduleName, 'rotation');
        
        return scene.flags.LockView;
    }
    
}