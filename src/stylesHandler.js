export class StylesHandler {

    blackenSidebar = '';
    blackenAVDock = '';
    uiElements = '';

    constructor() {
        this.styleSheet = new CSSStyleSheet();
        document.adoptedStyleSheets = [this.styleSheet, ...document.adoptedStyleSheets];
    }

    setBlackenSidebar(en) {
        if (en) {
            const isLightMode = document.getElementById('interface').classList.contains('theme-light');
            this.blackenSidebar = `
                .sidebar-tab {
                    background: ${isLightMode ? "url('../ui/parchment.jpg')" : "rgba(11, 10, 19, 1)"};
                }`
        }
        else
            this.blackenSidebar = '';

        this.set();
    }

    setBlackenAVDock(en) {
        if (en) {
            const isLightMode = document.getElementById('interface').classList.contains('theme-light');
            this.blackenAVDock = `
                #camera-views {
                    background: ${isLightMode ? "url('../ui/parchment.jpg')" : "rgba(11, 10, 19, 1)"};
                }`
            }
        else
            this.blackenAVDock = '';

        this.set();
    }

    set() {
        this.styleSheet.replaceSync(`
            ${this.blackenSidebar}
            ${this.blackenAVDock}
            ${this.uiElements}
        `)
    }
}