import { moduleName } from "../../lockview.js";
import { Helpers } from "../helpers.js";
import { ViewboxDrawing } from "../viewbox.js";
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

function localize(str, category="InitialViewConfig") {
    return Helpers.localize(str, category)
}

export class InitialViewConfig extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "lockView-initialViewConfig",
        tag: "form",
        position: {
            width: 600
        },
        form: {
            closeOnSubmit: true,
            handler: InitialViewConfig.#onSubmit
        },
        window: {
            contentClasses: ["standard-form"],
            icon: "fa-solid fa-crop-simple fa-fw",
            controls: [
                {
                    icon: 'fas fa-circle-info',
                    label: "LOCKVIEW.Help",
                    action: "openDocumentation",
                },
              ]
        },
        actions: {
            openDocumentation: InitialViewConfig.openDocumentation,
            setToPhysicalGridSize: InitialViewConfig.onSetToPhysicalGridSize,
            captureView: InitialViewConfig.onCaptureView,
            snapToGrid: InitialViewConfig.onSnapToGrid
        }
    }

    static PARTS = {
        form: {
            template: "./modules/LockView/templates/initialViewConfig.hbs",
            scrollable: [""]
          }
    }

    get title() {
        return "Lock View: " + localize("Title");
    }

    static openDocumentation() {
        window.open(Helpers.getDocumentationUrl('sceneConfig/initialView/#initial-view-configurator'))
    }

    static onSetToPhysicalGridSize() {
        const screenSize = game.settings.get(moduleName,"DisplayWidth");
        const gridSize = game.settings.get(moduleName,"Gridsize");
        this.initialView.scale = gridSize*screen.width/(screenSize*this.scene.grid.size);

        this.setInitialViewValues(this.initialView);
        this.data.width = window.innerWidth/this.initialView.scale;
        this.data.height = window.innerHeight/this.initialView.scale;
        if (this.viewbox) this.viewbox.update(this.data);
    }

    static onCaptureView(event, target) {
        const userId = this.element.querySelector('select[name="playerView"]').value;
        
        if (userId === game.userId) {
            this.initialView = canvas.scene._viewPosition;
            this.data.position = canvas.scene._viewPosition;
            this.data.width = window.innerWidth/canvas.scene._viewPosition.scale;
            this.data.height = window.innerHeight/canvas.scene._viewPosition.scale;
            this.setInitialViewValues(this.initialView);
            if (this.viewbox) this.viewbox.update(this.data);
        }
        else {
            const viewbox = lockView.viewbox.viewboxes[userId];
            if (!viewbox) return;
            this.data.position = viewbox.data.position;
            this.data.width = viewbox.data.width;
            this.data.height = viewbox.data.height;
            this.initialView = viewbox.data.position;
            this.setInitialViewValues(this.initialView);
            if (this.viewbox) this.viewbox.update(this.data);
        }

    }

    static onSnapToGrid(event, target) {
        const snapDirection = this.element.querySelector('select[name="snapToGrid"]').value;
        
        const w = this.data.width/2;
        const h = this.data.height/2;

        let position = {};
        if (snapDirection == 'topLeft') position = {x: this.data.position.x - w, y: this.data.position.y - h};
        else if (snapDirection == 'topRight') position = {x: this.data.position.x + w, y: this.data.position.y - h};
        else if (snapDirection == 'bottomLeft') position = {x: this.data.position.x - w, y: this.data.position.y + h};
        else if (snapDirection == 'bottomRight') position = {x: this.data.position.x + w, y: this.data.position.y + h};

        const centerPoint = canvas.grid.getCenterPoint({x:position.x, y:position.y});
        const gridSize = this.scene.grid.size;
        position.x = (position.x - centerPoint.x <= 0) ? centerPoint.x - gridSize/2 : centerPoint.x + gridSize/2;
        position.y = (position.y - centerPoint.y <= 0) ? centerPoint.y - gridSize/2 : centerPoint.y + gridSize/2;

        let newPosition = {};
        if (snapDirection == 'topLeft') newPosition = {x: position.x + w, y: position.y + h};
        else if (snapDirection == 'topRight') newPosition = {x: position.x - w, y: position.y + h};
        else if (snapDirection == 'bottomLeft') newPosition = {x: position.x + w, y: position.y - h};
        else if (snapDirection == 'bottomRight') newPosition = {x: position.x - w, y: position.y - h};

        this.update({position:newPosition})
    }

    setScene(scene) {
        this.scene = scene;
        return this;
    }


    //Prepare data to be handled
    async _prepareContext(options) {
        const gridSpaces = {
            x: Helpers.setSignificance(window.innerWidth/(this.scene.initial.scale*this.scene.grid.sizeX), 4),
            y: Helpers.setSignificance(window.innerHeight/(this.scene.initial.scale*this.scene.grid.sizeY), 4)
        }

        let users = [{ value: game.userId, label: game.user.name }];
        for (let viewbox of Object.values(lockView.viewbox.viewboxes)) {
            const user = game.users.get(viewbox.userId);
            if (user.viewedScene !== canvas.scene.id) continue;
            if (user.viewedScene !== this.scene.id) continue;
            users.push({ value: user._id, label: user.name })
        }

        return {
           initialView: {
            x: this.scene.initial.x ? Helpers.setSignificance(this.scene.initial.x, 4) : undefined,
            y: this.scene.initial.y ? Helpers.setSignificance(this.scene.initial.y, 4) : undefined,
            scale: this.scene.initial.scale ? Helpers.setSignificance(this.scene.initial.scale, 4) : undefined,
           },
           gridSpaces,
           snapToGridOptions: [
            { value: 'topLeft', label: localize('SnapDir.TopLeft') },
            { value: 'topRight', label: localize('SnapDir.TopRight') },
            { value: 'bottomLeft', label: localize('SnapDir.BottomLeft') },
            { value: 'bottomRight', label: localize('SnapDir.BottomRight') },
           ],
           users
        }
    }

    _onRender(context, options) {

        ui.controls.activate({control: 'lockView'})

        this.initialView = this.scene.initial;
        this.data = {
            name: 'Initial View',
            color: '#ff0000',
            position: {
                x: this.scene.initial.x,
                y: this.scene.initial.y
            },
            width: window.innerWidth/this.scene.initial.scale,
            height: window.innerHeight/this.scene.initial.scale
        };

        //Draw viewbox
        if (canvas.scene.id === this.scene.id) {
            this.viewbox = new ViewboxDrawing('initialView', this.data, true, true);
            this.viewbox.enable(true).enableEdit(true);
        }

        this.element.querySelector('input[name="newInitial.x"]').addEventListener('change', (ev) => {
            this.initialView.x = ev.target.value;
            this.data.position.x = ev.target.value;
            if (this.viewbox) this.viewbox.update(this.data)
        });

        this.element.querySelector('input[name="newInitial.y"]').addEventListener('change', (ev) => {
            this.initialView.y = ev.target.value;
            this.data.position.y = ev.target.value;
            if (this.viewbox) this.viewbox.update(this.data);
        });

        this.element.querySelector('input[name="newInitial.scale"]').addEventListener('change', (ev) => {
            this.initialView.scale = ev.target.value;
            this.data.width = window.innerWidth/ev.target.value;
            this.data.height = window.innerHeight/ev.target.value;
            if (this.viewbox) this.viewbox.update(this.data);
            this.setInitialViewValues(this.initialView);
        });

        this.element.querySelector('input[name="gridSpaces.x"]').addEventListener('change', (ev) => {
            this.initialView.scale = window.innerWidth/(ev.target.value*this.scene.grid.sizeX);
            this.setInitialViewValues(this.initialView);
            this.data.width = window.innerWidth/this.initialView.scale;
            this.data.height = window.innerHeight/this.initialView.scale;
            if (this.viewbox) this.viewbox.update(this.data);
        });

        this.element.querySelector('input[name="gridSpaces.y"]').addEventListener('change', (ev) => {
            this.initialView.scale = window.innerHeight/(ev.target.value*this.scene.grid.sizeY);
            this.setInitialViewValues(this.initialView);
            this.data.width = window.innerWidth/this.initialView.scale;
            this.data.height = window.innerHeight/this.initialView.scale;
            if (this.viewbox) this.viewbox.update(this.data);
        });
        
    }

    update(data) {
        if (data.width) this.data.width = data.width;
        if (data.height) this.data.height = data.height;
        if (data.position?.x) {
            this.data.position.x = data.position.x;
            this.initialView.x = data.position.x;
        }
        if (data.position?.y) {
            this.data.position.y = data.position.y;
            this.initialView.y = data.position.y;
        }
        if (data.position?.scale) {
            this.data.position.scale = data.position.scale;
            this.initialView.scale = data.position.scale;
        }
        if (this.viewbox) this.viewbox.update(this.data);
        this.setInitialViewValues(this.initialView);
    }

    setInitialViewValues(view) {
        if (!view) view = this.initialView;
        this.element.querySelector('input[name="newInitial.x"]').value = view.x ? Math.round(view.x) : undefined;
        this.element.querySelector('input[name="newInitial.y"]').value = view.y ? Math.round(view.y) : undefined;
        this.element.querySelector('input[name="newInitial.scale"]').value = Helpers.setSignificance(view.scale, 4);
        this.element.querySelector('input[name="gridSpaces.x"]').value = Helpers.setSignificance(window.innerWidth/(view.scale*this.scene.grid.sizeX), 4);
        this.element.querySelector('input[name="gridSpaces.y"]').value = Helpers.setSignificance(window.innerHeight/(view.scale*this.scene.grid.sizeY), 4);
    }

    static async #onSubmit(event, form, formData) {
        const submitData = foundry.utils.expandObject(formData.object);
        this.scene.update({initial:submitData.newInitial});
    }

    _onClose(options) {
        if (this.viewbox) {
            this.viewbox.remove();
            this.viewbox = undefined;
        }
        super._onClose(options);
    }
}