import { moduleName } from "../lockview.js";
import { Helpers } from "./helpers.js";

/**
 * The Viewbox class handles the display of viewboxes for users with 'Control' enabled, 
 * and it handles the transmission of viewbox data for users with 'Viewbox' enabled.
 * The actual viewboxes that are displayed on screen are handled by the ViewboxDrawing class.
 */
export class Viewbox {
    viewboxes = {};         /* Stores all the viewboxes */
    editEnabled = false;    /* Allows editing of viewboxes if set to true */
    enabled = false;        /* Displays the viewboxes if set to true */
    activeViewbox;          /* Stores the user id of the active viewbox */

    constructor() {
        Hooks.on('userConnected', (user, connected) => {
            if (Helpers.getUserSetting('control') && !connected) this.remove(user);
        })

        this.enabled = game.settings.get(moduleName, 'viewboxEnable');
    }

    /**
     * Cycle through the viewboxes to set the next one active. Key is set with keybinding 'cycleViewboxes'
     */
    cycleViewboxes() {
        if (!this.activeViewbox || !this.enabled || !this.editEnabled) return;
        let vBoxes = Object.values(this.viewboxes);
        if (vBoxes.length <= 1) return;
        let index = vBoxes.findIndex(b => b.userId === this.activeViewbox);
        index++;
        if (index >= vBoxes.length) index = 0;
        this.setActiveViewbox(vBoxes[index].userId);
    }

    /**
     * Set a viewbox as the active viewbox
     * @param {*} userId User ID of the viewbox to set active
     */
    setActiveViewbox(userId) {
        if (!userId || this.activeViewbox === userId) return;
        if (this.activeViewbox) this.viewboxes[this.activeViewbox]?.setActive(false);
        this.viewboxes[userId]?.setActive(true);
        this.activeViewbox = userId;
    }

    /**
     * @returns The User ID of the current active viewbox
     */
    getActiveViewbox() {
        return this.activeViewbox;
    }

    /**
     * Enable or disable viewboxes
     */
    enable(en) {
        this.enabled = en;
        Object.values(this.viewboxes).forEach((vb)=>{
            vb.enable(en);
        })
        game.settings.set(moduleName, 'viewboxEnable', en);
    }

    /**
     * Enable or disable editing of viewboxes
     */
    enableEdit(en) {
        this.editEnabled = en;
        Object.values(this.viewboxes).forEach((vb)=>{
            vb.enableEdit(en);
        })
    }

    /**
     * Emit the current view to users with 'Control' enabled.
     * Only happens for users with 'Viewbox' enabled.
     */
    emit() {
        if (!Helpers.getUserSetting('viewbox')) return;
        lockView.socket.emitViewbox();
    }

    /**
     * Update the viewbox, this happens when a user with 'Viewbox' enabled calls emit().
     */
    update(senderId, data) {
        if (data.scene !== canvas.scene.id && this.viewboxes[senderId]) {
            this.viewboxes[senderId].visible = false;
            return;
        }
        
        if (this.viewboxes[senderId]) {
            this.viewboxes[senderId].update(data);
        }
        else {
            this.viewboxes[senderId] = new ViewboxDrawing(senderId, data, this.enabled);
        }

        if (!this.activeViewbox) {
            this.setActiveViewbox(senderId);
        }
    }

    /**
     * Remove the viewbox of a user, for example when they disconnect.
     * @param {*} user 
     */
    remove(user) {
        if (this.viewboxes[user.id]) this.viewboxes[user.id].visible = false;
    }

    /**
     * Remove all viewboxes
     */
    removeAll() {
        Object.values(this.viewboxes).forEach(vb => vb.visible = false);
    }
}

/**
 * Class to draw viewboxes on the screen for users with 'Control' enabled.
 */
export class ViewboxDrawing extends foundry.canvas.layers.CanvasLayer {
    editEnabled = false;
    enabled = false;
    interactiveChildren = true;
    active = false;

    constructor(userId, data, enabled=false, isInitialView=false) {
        super();
        this.userId = userId;
        this.data = data;
        this.userName = data.name;
        this.isInitialView = isInitialView;
        this.enabled = enabled;

        /* Main container */
        this.container = new PIXI.Container();
        this.container.visible = enabled;
        this.container.interactiveChildren = true;
        this.addChild(this.container);

        /* Rectangle that corresponds with the view of the user */
        this.box = new PIXI.Graphics()
            .lineStyle(2 + 4*this.active*this.editEnabled, data.color, 1)
            .drawRect(0, 0, data.width, data.height)
        
        this.box.eventMode = 'dynamic';
        this.container.addChild(this.box);

        /* Label to display name of the user */
        this.label = new PIXI.Text(data.name, {fontFamily : 'Arial', fontSize: 24, fontWeight : 'bold', fill : data.color, align : 'center'});
        this.label.anchor.set(0.5);
        this.label.position.set(data.width / 2,-15);
        this.container.addChild(this.label);

        /* Button to move the view of a user. Only visible if this.editEnabled is true */
        this.moveButton = this.drawButton({
            icon: 'modules/LockView/img/icons/arrows-alt-solid.png',
            offset: { x: -20, y: -20 },
            color: data.color,
            cursor: 'move',
            type: 'move'
        }, this);
        this.container.addChild(this.moveButton);

        /* Button to resize the view of a user. Only visible if this.editEnabled is true */
        this.resizeButton = this.drawButton({
            icon: 'modules/LockView/img/icons/compress-arrows-alt-solid.png',
            offset: { x: 20 + data.width, y: 20 + data.height },
            color: data.color,
            cursor: 'nw-resize',
            type: 'resize'
        }, this);
        this.container.addChild(this.resizeButton);

        this.container.setTransform(data.position.x - data.width/2, data.position.y - data.height/2);

        canvas.stage.addChild(this);
    }

    async draw() {
        super.draw();
    }

    remove() {
        canvas.stage.removeChild(this);
    }

    /**
     * Set the viewbox as active.
     */
    setActive(en) {
        this.active = en;
        this.update(this.data);
        this.zIndex = en;
        return this;
    }

    /**
     * Enable/disable the viewbox. Viewbox will be hidden if disabled.
     */
    enable(en) {
        this.enabled = en;
        this.container.visible = en;
        return this;
    }

    /**
     * Enable/disable editing of the viewbox, either through the buttons, by right-dragging or the mousewheel.
     */
    enableEdit(en) {
        let parent = this;
        this.editEnabled = en;              
        this.moveButton.visible = en;       /* Show or hide the move button based on whether editing is enabled */
        this.resizeButton.visible = en;     /* Show or hide the resize button based on whether editing is enabled */
        let userId = this.userId;   
        let startUserData;

        this.update(this.data);

        if (en && !this.isInitialView) this.box.on('rightdown', onDragStart);
        this.box.on('rightup', onDragEnd);
        this.box.on('rightupoutside', onDragEnd);

        /* 
            Called when right mouse button is held down. 
            Sets the current viewbox as active,
            Stores the current view,
            Enables the 'globalpointermove' event
        */
        function onDragStart() {
            if (!game.settings.get(moduleName, 'rightClickViewboxDrag')) return;
            lockView.viewbox.setActiveViewbox(userId);
            startUserData = structuredClone(parent.data);
            parent.box.on('globalpointermove', onDragMove);
        }

        /* Called when the right mouse button is released. Removes the 'globalpointermove' event */
        function onDragEnd() {
            parent.box.off('globalpointermove', onDragMove)
        }

        /*
            Called when the mouse is moved while holding down the right mouse button.
            Calculates how far the mouse has moved and how far the view of the user should move, then sends this over sockets to the user.
        */
        function onDragMove(ev) {
            if (!ev.interactionData) return;
            const movedCoords = {
                x: ev.interactionData.destination.x - ev.interactionData.origin.x,
                y: ev.interactionData.destination.y - ev.interactionData.origin.y
            }
            const position = {
                x: startUserData.position.x + movedCoords.x - startUserData.width/2,
                y: startUserData.position.y + movedCoords.y - startUserData.height/2
            }

            lockView.socket.setView({
                type: 'absolute',
                userId: lockView.viewbox.getActiveViewbox(),
                position
            })
        }

        return this;
    }

    /**
     * Update the displayed viewbox. Called when the user's view has changed.
     */
    update(data) {
        this.data = data;
        this.visible = true;

        this.box.clear()
            .lineStyle(2 + 4*this.active*this.editEnabled, this.data.color, 1)
            .drawRect(0, 0, this.data.width, this.data.height) 
            .hitArea = new PIXI.Rectangle(0, 0, data.width, data.height)
        this.label.position.set(data.width / 2,-15);
        this.resizeButton.setTransform(20 + data.width, 20 + data.height);
        
        this.container.setTransform(data.position.x - data.width/2, data.position.y - data.height/2);
    }

    /**
     * Draw the edit buttons
     */
    drawButton(data, parentContainer) {
        let container = new PIXI.Container();
        container.visible = parentContainer.editEnabled;

        let button = new PIXI.Graphics();
        button.lineStyle(2, data.color, 1);
        button.beginFill(data.color);
        button.drawCircle(0, 0, 20);
        container.addChild(button);

        let icon = PIXI.Sprite.from(data.icon);
        icon.anchor.set(0.5);
        icon.scale.set(0.25);
        icon.position.set(0, 0);
        container.addChild(icon);

        container.setTransform(data.offset.x, data.offset.y);
        container.cursor = data.cursor;
        container.eventMode = 'static';

        container.on('pointerdown', onDragStart, container);
        container.on('pointerup', onDragEnd);
        container.on('pointerupoutside', onDragEnd);
        
        let userId = this.userId;
        let startUserData;
        let parent = this;

        /* Called when the button is clicked, enables 'globalpointermove' event */
        function onDragStart() {
            lockView.viewbox.setActiveViewbox(userId);
            startUserData = parentContainer.data;
            container.on('globalpointermove', onDragMove);
        }

        /* Called when mouse button is released, removes 'globalpointermove' event */
        function onDragEnd() {
            container.off('globalpointermove', onDragMove)
        }

        /* Called when the mouse is moved when the button was pressed. */
        function onDragMove(ev) {
            
            /* For the move button, send the new coordinates to the user */
            if (data.type === 'move' && ev.interactionData?.destination) {
                if (parent.isInitialView) {
                    lockView.apps.initialViewConfig.update({
                        position: {
                            x: ev.interactionData.destination.x - data.offset.x + startUserData.width/2,
                            y: ev.interactionData.destination.y - data.offset.y + startUserData.height/2,
                            scale: window.innerWidth/startUserData.width
                        }
                    })
                }
                else {
                    lockView.socket.setView({
                        type: 'absolute',
                        userId,
                        position: {
                            x: ev.interactionData.destination.x - data.offset.x,
                            y: ev.interactionData.destination.y - data.offset.y
                        }
                    })
                }
            }

            /* For the resize button, calculate the new position and size of the view. */
            else if (data.type === 'resize' && ev.interactionData?.destination) {
                const movedCoords = {
                    x: ev.interactionData.origin.x - ev.interactionData.destination.x,
                    y: ev.interactionData.origin.y - ev.interactionData.destination.y
                }

                const moved = Math.max(movedCoords.x, movedCoords.y)

                const position = {
                        x: startUserData.position.x - startUserData.width/2, 
                        y: startUserData.position.y - startUserData.height/2
                    }

                if (parent.isInitialView) {
                    let scale = window.innerWidth/(startUserData.width - moved);
                    if (scale > 3 || scale < 0) return;

                    lockView.apps.initialViewConfig.update({
                        position: {
                            x: position.x + startUserData.width/2,
                            y: position.y + startUserData.height/2,
                            scale
                        },
                        width: (startUserData.width - moved),
                        height: (startUserData.height - moved) 
                    })
                }
                else {
                    lockView.socket.setView({
                        type: 'absolute',
                        userId,
                        position,
                        width: startUserData.width - moved,
                        height: startUserData.height - moved
                    })
                }
                
            }
        }

        return container;
    }
}