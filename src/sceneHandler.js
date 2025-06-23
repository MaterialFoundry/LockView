import { moduleName } from "../lockview.js";
import { Helpers } from "./helpers.js";

function localize(str, category="SceneConfig") {
    return Helpers.localize(str, category)
}

export class SceneHandler {

    forceUi = false;
    physicalGridSize;

    constructor() {
        Hooks.on('canvasReady', canvas => {
            this.onSceneLoad(canvas.scene, 'canvasReady');
        });

        Hooks.on('renderUIConfig', (app, form) => {
            const interfaceSetting = form.querySelector('select[name="core.uiConfig.colorScheme.interface"]');
            interfaceSetting?.addEventListener('change', () => {
                setTimeout(()=> {this.setUiElements(canvas.scene, 'uiConfig')},100);
            })
        });

        Hooks.on('createScene', async (scene, data) => {
            lockView.migrationHandler.migrateScene(scene);
        })

        /* Reconfigure the view and send an updated view to 'Control' users when the sidebar is collapsed or expanded */
        Hooks.on('collapseSidebar', (app, collapsed) => {
            if (Helpers.getUserSetting('enable')) {
                if (lockView.locks.pan && lockView.locks.zoom) {
                    this.setAutoscale();
                }
                this.setUiElements(canvas.scene, collapsed ? 'sidebarCollapse' : 'off')
            }
            
            lockView.viewbox.emit();
        })

        this.calculatePhysicalGridsize();
    }

    async onSceneLoad(scene, source) {
        //Set locks
        const locks = scene.getFlag(moduleName, 'locks');
        lockView.locks.update(locks);
        this.setUiElements(scene, source);
        if (Helpers.getUserSetting('enable')) {
            this.setSidebar(scene);
            await this.forceInitialView(scene);
            this.setAutoscale(scene);
            if (locks.boundingBox) {
                Hooks.once('ready', ()=> canvas.pan(scene._viewPosition));
            }
        }
        
        lockView.socket.requestViewbox();
    }

    async forceInitialView(scene = canvas.scene) {
        if (!Helpers.getUserSetting('enable')) return;

        const forceInitial = scene.getFlag(moduleName, 'forceInitialView');
        if (!forceInitial) return;

        const currentLocks = lockView.locks.applyLocks;
        if (currentLocks) lockView.locks.applyLocks = false;
        await canvas.pan( canvas.scene.initial );
        if (currentLocks) lockView.locks.applyLocks = true;
    }

    getAutoscale(mode, scene = canvas.scene) {
        
        let windowWidth = window.innerWidth;
        let pos = {
            x: canvas.dimensions.sceneX + scene.width/2,
            y: canvas.dimensions.sceneY + scene.height/2
        };
        if (canvas.scene.getFlag(moduleName, 'sidebar')?.exclude) {
            windowWidth -= Helpers.getSidebarWidth();
            pos.x += 0.5*Helpers.getSidebarWidth()/canvas.scene._viewPosition.scale
        }

        if (mode === 'horizontal') pos.scale = windowWidth/scene.width;
        else if (mode === 'vertical') pos.scale = window.innerHeight/scene.height;
        else if (mode === 'autoInside') pos.scale = Math.max(window.innerWidth/scene.width, window.innerHeight/scene.height);
        else if (mode === 'autoOutside') pos.scale = Math.min(window.innerWidth/scene.width, window.innerHeight/scene.height);
        else if (mode === 'physical') pos = {scale: this.physicalGridSize/scene.grid.size};

        return pos;
    }

    async setAutoscale(scene = canvas.scene) {
        const autoscale = scene.getFlag(moduleName, 'autoscale');
        if (!autoscale || autoscale === 'off') return;

        const currentLocks = lockView.locks.applyLocks;
        if (currentLocks) lockView.locks.applyLocks = false;
        await canvas.pan( this.getAutoscale(autoscale, scene) );
        if (currentLocks) lockView.locks.applyLocks = true;
    }

    calculatePhysicalGridsize(forceRefresh=false) {
        const screenSize = game.settings.get(moduleName,"DisplayWidth");
        const gridSize = game.settings.get(moduleName,"Gridsize");
        this.physicalGridSize = gridSize*screen.width/screenSize;
        if (forceRefresh) this.setAutoscale();
    }

    onSceneUpdate(scene, source, emitUpdate=false) {
        //Send socket to other players
        if (emitUpdate) lockView.socket.sceneUpdated({scene: scene._id})
        
        if (scene._id !== canvas.scene._id) return;
        this.onSceneLoad(scene, source);
        ui.controls._configureRenderOptions({reset:true});
        ui.controls.render();
    }

    setUiElements(scene, source) {
        const uiFlags = scene.getFlag(moduleName, 'ui');
        if (!Helpers.getUserSetting('enable')) {
            for (let [elmntId, hide] of Object.entries(uiFlags)) 
                if (document.getElementById(elmntId)) {
                    if (elmntId === 'camera-views') document.getElementById(elmntId).style.display = '';
                    else document.getElementById(elmntId).style.visibility = '';
                }
            lockView.styles.setBlackenSidebar(false);
            return;
        }

        const blackenSidebar = scene.getFlag(moduleName, 'sidebar').blacken;
        lockView.styles.setBlackenSidebar(blackenSidebar);
        

        if (uiFlags.hideOn === 'always' || (uiFlags.hideOn === 'sceneLoad' && source === 'canvasReady') || (uiFlags.hideOn === 'sidebar' && source === 'sidebarCollapse')) {
            for (let [elmntId, hide] of Object.entries(uiFlags)) 
                if (document.getElementById(elmntId)) {
                    if (elmntId === 'camera-views') document.getElementById(elmntId).style.display = (hide && !this.forceUi) ? 'none' : '';
                    else document.getElementById(elmntId).style.visibility = (hide && !this.forceUi) ? 'hidden' : '';
                }
        }
        else if (uiFlags.hideOn === 'off' || source === 'off') {
            for (let [elmntId, hide] of Object.entries(uiFlags)) 
                if (document.getElementById(elmntId)) {
                    if (elmntId === 'camera-views') document.getElementById(elmntId).style.display = '';
                    else document.getElementById(elmntId).style.visibility = '';
                }
        }
    } 

    setSidebar(scene) {
        const sidebarFlags = scene.getFlag(moduleName, 'sidebar');
        
        if (sidebarFlags.sceneLoad !== 'noChange') {
            if (sidebarFlags.sceneLoad === 'expand') ui.sidebar.expand();
            else if (sidebarFlags.sceneLoad === 'collapse') ui.sidebar.collapse();
        }
    }

    forceShowUi() {
        this.forceUi = !this.forceUi;
        const hideOn = canvas.scene.getFlag(moduleName, 'ui').hideOn;
        if (hideOn === 'sidebar') this.setUiElements(canvas.scene, ui.sidebar.expanded ? 'off' : 'sidebarCollapse');
        else this.setUiElements(canvas.scene, 'forceShowUi');
    }

    getSceneSettings(flags) {
        return [
            {
                id: 'locks',
                type: 'wrapper',
                settings: [
                    {
                        id: 'pan',
                        datafield: new foundry.data.fields.BooleanField({label: localize('Locks.PanLock'), hint: localize('Locks.PanLock_Hint'), initial: flags.locks.pan}, {name: 'lockview.locks.pan'})
                    },{
                        id: 'zoom',
                        datafield: new foundry.data.fields.BooleanField({label: localize('Locks.ZoomLock'), hint: localize('Locks.ZoomLock_Hint'), initial: flags.locks.zoom}, {name: 'lockview.locks.zoom'})
                    },{
                        id: 'boundingBox',
                        datafield: new foundry.data.fields.BooleanField({label: localize('Locks.BoundingBox'), hint: localize('Locks.BoundingBox_Hint'), initial: flags.locks.boundingBox}, {name: 'lockview.locks.boundingBox'})
                    }
                ]
            },{
                id: 'autoscale',
                type: 'select',
                options: [
                    { value: 'off', label: localize('Autoscale.Off') },
                    { value: 'horizontal', label: localize('Autoscale.HorizontalFit') },
                    { value: 'vertical', label: localize('Autoscale.VerticalFit') },
                    { value: 'autoInside', label: localize('Autoscale.AutomaticFitInside') },
                    { value: 'autoOutside', label: localize('Autoscale.AutomaticFitOutside') },
                    { value: 'physical', label: localize('Autoscale.PhysicalGridSize') }
                ],
                value: flags.autoscale
            },{
                id: 'sidebar',
                type: 'wrapper',
                settings: [
                    {
                        id: 'sceneLoad',
                        type: 'select',
                        options: [
                            { value: 'noChange', label: localize('Sidebar.NoChange') },
                            { value: 'collapse', label: localize('Sidebar.Collapse') },
                            { value: 'expand', label: localize('Sidebar.Expand') }
                        ],
                        value: flags.sidebar.sceneLoad
                    },{
                        id: 'exclude',
                        datafield: new foundry.data.fields.BooleanField({label: localize('Sidebar.ExcludeSidebar'), hint: localize('Sidebar.ExcludeSidebar_Hint'), initial: flags.sidebar.exclude}, {name: 'lockview.sidebar.exclude'})
                    },{
                        id: 'blacken',
                        datafield: new foundry.data.fields.BooleanField({label: localize('Sidebar.BlackenSidebar'), hint: localize('Sidebar.ExcludeSidebar_Hint'), initial: flags.sidebar.blacken}, {name: 'lockview.sidebar.blacken'})
                    }
                ]
            },{
                id: 'ui',
                type: 'wrapper',
                settings: [
                    {
                        id: 'hideOn',
                        type: 'select',
                        options: [
                            { value: 'off', label: localize('UI.HideOnNever') },
                            { value: 'always', label: localize('UI.HideAlways') },
                            { value: 'sceneLoad', label: localize('UI.HideOnSceneLoad') },
                            { value: 'sidebar', label: localize('UI.HideOnSidebarCollapse') }
                        ],
                        value: flags.ui.hideOn
                    },{
                        id: 'sceneControls',
                        datafield: new foundry.data.fields.BooleanField({label: localize('UI.SceneControls'), initial: flags.ui["scene-controls"]}, {name: 'lockview.ui.scene-controls'})
                    },{
                        id: 'hotbar',
                        datafield: new foundry.data.fields.BooleanField({label: localize('UI.Hotbar'), initial: flags.ui.hotbar}, {name: 'lockview.ui.hotbar'})
                    },{
                        id: 'sceneNavigation',
                        datafield: new foundry.data.fields.BooleanField({label: localize('UI.SceneNavigation'), initial: flags.ui["scene-navigation"]}, {name: 'lockview.ui.scene-navigation'})
                    },{
                        id: 'players',
                        datafield: new foundry.data.fields.BooleanField({label: localize('UI.Players'), initial: flags.ui.players}, {name: 'lockview.ui.players'})
                    },{
                        id: 'chatNotifications',
                        datafield: new foundry.data.fields.BooleanField({label: localize('UI.ChatNotifications'), initial: flags.ui["chat-notifications"]}, {name: 'lockview.ui.chat-notifications'})
                    },{
                        id: 'cameraViews',
                        datafield: new foundry.data.fields.BooleanField({label: localize('UI.CameraViews'), initial: flags.ui["camera-views"]}, {name: 'lockview.ui.camera-views'})
                    },{
                        id: 'sidebar',
                        datafield: new foundry.data.fields.BooleanField({label: localize('UI.Sidebar'), initial: flags.ui.sidebar}, {name: 'lockview.ui.sidebar'})
                    }
                ]
            },{
                id: 'forceInitialView',
                datafield: new foundry.data.fields.BooleanField({label: localize('ForceInitialView.Label'), initial: flags.forceInitialView}, {name: 'lockview.forceInitialView'})
            }
        ]
    }

    getSceneConfig(flags, settings) {
        if (!settings) settings = this.getSceneSettings(flags);
        let config = {};
        for (let s of settings) {
            let setting = {};
            if (s.type === 'wrapper') 
                setting = this.getSceneConfig(flags, s.settings);
            else if (s.datafield)
                setting = s.datafield;
            else if (s.type === 'select') {
                setting = s;
            }

            config[s.id] = setting;
        }
        return config;
    }

    defaultSceneConfig = {
        locks: {
            pan: false,
            zoom: false,
            boundingBox: false
        },
        ui: {
            hideOn: 'off', //options: 'off', 'always', 'sceneLoad', 'sidebar'
            "scene-controls": false,
            hotbar: false,
            "scene-navigation": false,
            players: false,
            sidebar: false,
            "chat-notifications": false,
            "camera-views": false
        },
        sidebar: {
            sceneLoad: 'noChange', //options: 'noChange', 'collapse', 'expand'
            exclude: false,
            blacken: false
        },
        autoscale: 'off', //options: 'off', 'horizontal', 'vertical', 'autoInside', 'autoOutside', 'physical'
        forceInitialView: false
    }
}