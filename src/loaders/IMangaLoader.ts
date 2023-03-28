import { TaskGroup, Task } from "../../../commons-ts/src/DownloadManager";

export default interface IMangaLoader {
    matchUrl(url: string|null) : boolean;
    generateTaskGroup(id: string|number, category: string) : TaskGroup | null;
    generateTasks(groupId: string|number) : Task[];
}