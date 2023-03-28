import { TaskGroup, Task } from '../../../commons-ts/src/DownloadManager';
import Logger from '../../../commons-ts/src/Logger';
import IMangaLoader from './IMangaLoader';
import Config from '../../../commons-ts/src/Config';

// @ts-ignore
let $ = unsafeWindow.jQuery;
let logger = Logger.getLogger();
let config = Config.getInstance();

export default class TelegraphLoader implements IMangaLoader {
    pattern: RegExp = /^https:\/\/telegra\.ph(\/.*)$/;
    proxy: string | null = null;

    constructor() {
        logger.info("正在注册Telegraph");
        this.reload();
    }

    reload() {
        let networkCfg = config.getValue("network", {
            proxy: "http://127.0.0.1:8118"
        });
        this.proxy = networkCfg.proxy;
    }

    getDir(category: string) : string {
        let categories = config.getValue("categories", {
            "manga": "",
            "cosplay": ""
        });
        // @ts-ignore
        let dir: string | null = categories[category];
        if (dir != null) return dir;
        return "";
    }

    generateFileName(src: string, pageIndex: number, pageAmount: number) : string | null {
        if (pageAmount <= 0) return null;

        let url = new URL(src);
        let path = url.pathname;
        let index = path.lastIndexOf(".");
        let extName = path.substring(index);
        let fileNameLength = Math.ceil(Math.log10(pageAmount + 1));
        let fileName = pageIndex + "";
        let zeroAmount = fileNameLength - fileName.length;
        if (zeroAmount < 0) zeroAmount = 0;
        return '0'.repeat(zeroAmount) + fileName + extName;
    }

    matchUrl(url: string|null = null): boolean {
        if (url == null) {
            url = unsafeWindow.location.href
        }
        let matcher = this.pattern.exec(url);
        if (matcher != null) {
            return true;
        }
        return false;
    }

    generateTaskGroup(id: string|number, category: string): TaskGroup {
        let title = $("header > h1").text();
        let group = new TaskGroup(
            id,
            title,
            this.getDir(category),
            this.proxy
        );
        logger.debug("已创建任务组：", group);
        return group;
    }

    generateTasks(groupId: string|number): Task[] {
        let tasks: Task[] = [];
        let imgs = $("figure img");
        for (let index=1; index<=imgs.length; index++) {
            let img = imgs[index - 1];
            let src = img.src;
            logger.info(`第${index}张图片URL：${src}`);
            let fileName = this.generateFileName(src, index, imgs.length);
            let task = new Task(
                groupId + "." + index,
                src,
                fileName
            );
            tasks.push(task);
        }
        return tasks
    }
}