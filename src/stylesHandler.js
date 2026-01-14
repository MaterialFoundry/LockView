export class StylesHandler {

    blackenSidebar = '';
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

    set() {
        this.styleSheet.replaceSync(`
            ${this.blackenSidebar}
            ${this.uiElements}
        `)
    }
}