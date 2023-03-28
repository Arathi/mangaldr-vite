import Logger from "../../commons-ts/src/Logger";
import VueAppLoader from "../../commons-ts/src/VueAppLoader";
import IMangaLoader from "./loaders/IMangaLoader";
import TelegraphLoader from "./loaders/TelegraphLoader";

import appOptions from './appOptions';
import { Aria2Client } from "../../commons-ts/src/Aria2Client";
import Config from "../../commons-ts/src/Config";

let styles = `
div#mangaldr {
    position: fixed;
    top: 10px;
    left: 10px;
}

div#mangaldr .el-row {
  margin-bottom: 12px;
}

div#mangaldr-window {
    background-color: #fcfcfc;
    padding: 10px;
    border: 1px solid var(--el-border-color);
}
`;

// @ts-ignore
let $ = unsafeWindow.jQuery;

async function main() {
    let logger = Logger.getLogger("mangaldr");
    logger.info(`${GM_info.script.name} v${GM_info.script.version}`);
    logger.info(`jQuery ${$.fn.jquery}`);

    let config = Config.getInstance();

    // #region loggerPlugin
    let loggerPlugin = {
        // @ts-ignore
        install(app) {
            return app.config.globalProperties.$logger = logger;
        }
    };
    // #endregion
    
    // #region loaderPlugin
    // TODO 根据配置加载
    let loaders = [
        new TelegraphLoader()
    ];
    let loaderPlugin = {
        // @ts-ignore
        install(app) {
            let selectLoader: IMangaLoader | null = null;
            for (let loader of loaders) {
                if (loader.matchUrl()) {
                    selectLoader = loader;
                }
            }
            if (selectLoader == null) {
                logger.warn("当前站点未找到适配的MangaLoader实例");
            }
            else {
                logger.info("当前站点使用");
            }
            return app.config.globalProperties.$loader = selectLoader;
        }
    }
    // #endregion

    // #region aria2Plugin
    let aria2Cfg = config.getValue("aria2", {
        url: "ws://127.0.0.1:6800/jsonrpc",
        token: "47bfbcf3",
    });
    let aria2 = new Aria2Client(aria2Cfg);
    let aria2Plugin = {
        // @ts-ignore
        install(app) {
            return app.config.globalProperties.$aria2 = aria2;
        }
    };
    // #endregion

    let vueAppLoader = new VueAppLoader({
        mountPointId: "mangaldr",
        html: null,
        styles: styles,
        vueVersion: "3.2",
        elementVersion: "2.3",
        vueOptions: appOptions,
        provides: {},
        plugins: [
            loggerPlugin,
            loaderPlugin,
            aria2Plugin,
        ]
    });
    vueAppLoader.load();
}

main();