interface App {
    workspace: {
        activeLeaf: WorkspaceLeaf | null;
    };
}

interface Manifest {
    id: string;
    name: string;
    version: string;
    minAppVersion: string;
}

export class Notice {
    constructor(message: string) {
        console.log('Notice:', message);
    }
}

export class Plugin {
    app: App;
    manifest: Manifest;

    constructor() {
        this.app = {
            workspace: {
                activeLeaf: null
            }
        };
        this.manifest = {
            id: 'mock-plugin',
            name: 'Mock Plugin',
            version: '1.0.0',
            minAppVersion: '0.15.0'
        };
    }

    async loadSettings() {}
    async saveSettings() {}
    async onload() {}
    async onunload() {}
    addRibbonIcon() {}
    addStatusBarItem() {}
    addCommand() {}
    addSettingTab() {}
    saveData() {}
    loadData() {}
}

export class ItemView {
    leaf: WorkspaceLeaf;
    containerEl: HTMLElement;

    constructor(leaf: WorkspaceLeaf) {
        this.leaf = leaf;
        this.containerEl = document.createElement('div');
    }

    getViewType() {
        return '';
    }

    getDisplayText() {
        return '';
    }

    async onOpen() {}
    async onClose() {}
}

export class WorkspaceLeaf {
    view: ItemView | null;

    constructor() {
        this.view = null;
    }
}