// @ts-nocheck
// import Logger from '../../commons-ts/src/Logger';
// let logger = Logger.getLogger("app-options");

export default {
    template: `
<div id='mangaldr-window' :style="'width:' + windowWidth + 'px;'">
    <el-row>
        <el-col :span=12>
            <el-button type="primary" @click="onBtnStartClick" :disabled="!aria2Connected">开始下载</el-button>
        </el-col>
    </el-row>
    <el-row>
        <el-col :span=24>
            <el-progress 
                :text-inside="true"
                :stroke-width="24"
                :percentage="totalProgressPercentage"
                :status="totalStatus">
                <template #default="{percentage}">
                    <span>总进度：{{ percentage }}%</span>
                </template>
            </el-progress>
        </el-col>
    </el-row>
    <el-scrollbar :height="windowHeight - 102">
    <el-row type="flex" v-for="(task, index) in tasks">
        <el-col :span=4>
            {{ task.fileName }}
        </el-col>
        <el-col :span=4>
            <el-tag class="ml-2" :type="statusToTagType(task.status)">{{ statusToTagText(task.status) }}</el-tag>
        </el-col>
        <el-col :span=16>
            <el-progress 
                :text-inside="true"
                :stroke-width="24"
                :percentage="taskProgressPercentage(task)"
                :status="taskProgressStatus(task)">
            </el-progress>
        </el-col>
    </el-row>
    </el-scrollbar>
</div>
`,
    data() { return {
        groupId: crypto.randomUUID(),
        taskGroup: null,
        tasks: [],
        counter: 0,
        windowWidth: document.documentElement.clientWidth * 0.25,
        windowHeight: document.documentElement.clientHeight - 20,
        btnStartDisabled: true,
        aria2Connected: false,
    }},
    methods: {
        // 点击开始下载按钮
        onBtnStartClick() {
            let group = this.$loader.generateTaskGroup(this.groupId, "manga");
            this.startTasks(group);
        },

        // 开始任务
        startTasks(group) {
            this.$logger.info("开始任务");
            let self = this;
            for (let task of self.tasks) {
                let taskId = task.id;
                self.$logger.info(`正在获取任务${taskId}`);
                let uris = [ task.uri ];
                let options = {};
                if (group.dir != null) {
                    self.$logger.debug("--dir=", group.dir);
                    options.dir = group.dir;
                }
                if (task.fileName != null) {
                    self.$logger.debug("--out=", task.fileName);
                    options.out = task.fileName;
                }
                if (group.proxy != null) {
                    self.$logger.debug("--proxy=", group.proxy);
                    options["all-proxy"] = group.proxy;
                }
                self.$aria2.addUri(
                    uris,
                    options
                ).then((gid) => {
                    self.$logger.info(`任务${group.id}.${taskId}的gid获取成功: ${gid}`);
                    for (let t of self.tasks) {
                        t.gid = gid;
                    }
                    // TODO 启动状态获取
                });
            }
        },

        // 转换任务状态为tag文本
        statusToTagText(taskStatus) {
            if (taskStatus == null) {
                return "未提交";
            }

            let tag = "";
            switch (taskStatus) {
                case "active":
                    tag = "活动";
                    break;
                case "waiting":
                    tag = "等待";
                    break;
                case "paused":
                    tag = "暂停";
                    break;
                case "error":
                    tag = "错误";
                    break;
                case "complete":
                    tag = "完成";
                    break;
                case "removed":
                    tag = "移除";
                    break;
            }
            return tag;
        },

        // 转换任务状态为tag的状态（颜色）
        statusToTagType(taskStatus) {
            if (taskStatus == null) {
                return "";
            }

            let tag = "";
            switch (taskStatus) {
                case "active":
                    tag = "";
                    break;
                case "waiting":
                    tag = "info";
                    break;
                case "paused":
                    tag = "info";
                    break;
                case "error":
                    tag = "danger";
                    break;
                case "complete":
                    tag = "success";
                    break;
                case "removed":
                    tag = "warning";
                    break;
            }
            return tag;
        },

        // 任务进度条百分比
        taskProgressPercentage(task) {
            if (task.totalLength != null && task.totalLength > 0 && 
                task.completedLength != null && task.completedLength >= 0) {
                return task.completedLength * 100 / task.totalLength;
            }
            return 0;
        },

        // 任务进度条状态
        taskProgressStatus(task) {
            if (task == null) {
                return "";
            }

            let status = "";
            switch (task.status) {
                case "active":
                    status = "";
                    break;
                case "waiting":
                    status = "";
                    break;
                case "paused":
                    status = "warning";
                    break;
                case "error":
                    status = "exception";
                    break;
                case "complete":
                    status = "success";
                    break;
                case "removed":
                    status = "warning";
                    break;
            }

            return status;
        }
    },
    computed: {
        totalProgressPercentage() {
            let taskAmount = this.tasks.length;
            let completedTaskAmount = 0;
            for (let task of this.tasks) {
                if (task.status != null && task.status == "complete") completedTaskAmount++;
            }
            let progress = (taskAmount > 0) ? (completedTaskAmount / taskAmount) : 1;
            let percentage = progress * 100;
            return percentage;
        },
        totalStatus() {
            let status = "";
            let percentage = this.totalProgressPercentage;
            if (percentage >= 100) {
                status = "success"
            }
            this.$logger.info(`设置总进度条任务状态为${status}`);
            return status;
        }
    },
    mounted() {
        this.$logger.info("测试加载完成");

        

        let tasks = this.$loader.generateTasks(this.groupId);
        this.$logger.info(`生成下载任务${tasks.length}个`);
        this.tasks = tasks;

        let self = this;
        this.$aria2.getVersion().then((resp) => {
            self.$logger.info("Aria2连接成功，版本信息：", resp);
            self.aria2Connected = true;
        }).catch((err) => {
            self.$logger.warn("Aria2连接失败！", err);
            self.aria2Connected = false;
        });
    }
};