Vue.component('user-modal', {
    props: {
        showUserModal: Boolean,
        currentUser: String,
        closeModal: Function,
        registerUser: Function
    },
    data() {
        return {
            username: ''
        };
    },
    template: `
        <div v-if="showUserModal" class="modal">
            <div class="modal-content">
                <span class="close" @click="closeModal">&times;</span>
                <h2>{{ currentUser ? 'Сменить пользователя' : 'Регистрация' }}</h2>
                <input v-model="username" placeholder="Введите имя" maxlength="30" class="title-task"/>
                <button @click="register">
                    {{ currentUser ? 'Сменить пользователя' : 'Войти' }}
                </button>
            </div>
        </div>
    `,
    methods: {
        register() {
            if (this.username.trim()) {
                this.registerUser(this.username);
                this.username = '';
            }
        }
    }
});

Vue.component('task', {
    props: ['task', 'columnIndex', 'taskIndex', 'getNextColumnTitle', 'currentUser'],
    template: `
        <div class="task">
            <h3>{{ task.title }}</h3>
            <p><strong>Описание:</strong> {{ task.description }}</p>
            <p><strong>Создано:</strong> {{ task.createdAt }}</p>
            <p><strong>Обновлено:</strong> {{ task.updatedAt }}</p>
            <p><strong>Дэдлайн:</strong> {{ task.deadline }}</p>
            <p><strong>Автор:</strong> {{ task.author }}</p>
            <p v-if="task.returnReason && columnIndex === 1"><strong>Причина возврата:</strong> {{ task.returnReason }}</p>
            <p v-if="task.status"><strong>Статус:</strong> {{ task.status }}</p>
            <button v-if="columnIndex < 3 && canMoveTask" @click="$emit('move-task', columnIndex, columnIndex + 1, taskIndex)">
                {{ getNextColumnTitle(columnIndex) }}
            </button>
            <button v-if="columnIndex === 2 && task.author !== currentUser" @click="$emit('return-task', columnIndex, taskIndex)">Вернуть в работу</button>
            <div>
                <button v-if="(columnIndex === 0 || columnIndex === 1 || columnIndex === 2) && task.author === currentUser" @click="$emit('edit-task', columnIndex, taskIndex)">Редактировать</button>
                <button v-if="(columnIndex === 0 || columnIndex === 3) && task.author === currentUser" @click="$emit('delete-task', columnIndex, taskIndex)">Удалить</button>
            </div>
        </div>
    `,
    computed: {
        canMoveTask() {
            if (this.columnIndex === 2) {
                return this.task.author !== this.currentUser;
            }
            return true;
        }
    }
});

Vue.component('column', {
    props: ['column', 'columnIndex', 'addTask', 'getNextColumnTitle', 'currentUser'],
    template: `
        <div class="column">
            <h2>{{ column.title }}</h2>
            <task 
                v-for="(task, taskIndex) in column.tasks" 
                :key="taskIndex" 
                :task="task" 
                :columnIndex="columnIndex" 
                :taskIndex="taskIndex" 
                :getNextColumnTitle="getNextColumnTitle"
                :currentUser="currentUser"
                @move-task="$emit('move-task', ...arguments)"
                @edit-task="$emit('edit-task', ...arguments)"
                @delete-task="$emit('delete-task', ...arguments)"
                @return-task="$emit('return-task', ...arguments)"
            ></task>
            <button v-if="columnIndex === 0 && currentUser" @click="addTask">Добавить задачу</button>
        </div>
    `
});

Vue.component('task-return-modal', {
    props: {
        showModal: Boolean,
        newTask: Object,
        editingTaskIndex: Number,
        returnReason: String,
        isReturn: Boolean,
        saveTask: Function,
        confirmReturn: Function,
        closeModal: Function
    },
    template: `
        <div v-if="showModal" class="modal">
            <div class="modal-content">
                <span class="close" @click="closeModal">&times;</span>
                <h2>{{ isReturn ? 'Укажите причину возврата' : (editingTaskIndex !== null ? 'Редактировать задачу' : 'Добавить задачу') }}</h2>
                <div v-if="!isReturn">
                    <input v-model="newTask.title" placeholder="Заголовок задачи" maxlength="30" class="title-task"/>
                    <textarea v-model="newTask.description" class="description-input" placeholder="Описание задачи" maxlength="300"></textarea>
                    <p>Дедлайн:</p>
                    <input type="date" v-model="newTask.deadline" />
                    <button @click="saveTask">
                        {{ editingTaskIndex !== null ? 'Сохранить изменения' : 'Добавить задачу' }}
                    </button>
                </div>
                <div v-else>
                    <textarea v-model="newTask.returnReason" class="description-input" placeholder="Причина возврата" maxlength="300"></textarea>
                    <button @click="confirmReturn">Подтвердить возврат</button>
                </div>
            </div>
        </div>
    `
});

const app = new Vue({
    el: '#app',
    data: {
        columns: [
            { title: 'Запланированные задачи', tasks: [] },
            { title: 'Задачи в работе', tasks: [] },
            { title: 'Тестирование', tasks: [] },
            { title: 'Выполненные задачи', tasks: [] }
        ],
        newTask: {
            title: '',
            description: '',
            deadline: '',
            returnReason: '',
            author: ''
        },
        showModal: false,
        showUserModal: false,
        editingTaskIndex: null,
        editingColumnIndex: null,
        returnReason: '',
        showReturnModal: false,
        currentUser: null
    },
    created() {
        this.loadData();
        this.loadUser();
    },
    methods: {
        loadData() {
            const savedData = localStorage.getItem('kanbanData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                this.columns = parsedData.columns;
            }
        },
        loadUser() {
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                this.currentUser = savedUser;
            }
        },
        saveData() {
            const dataToSave = {
                columns: this.columns
            };
            localStorage.setItem('kanbanData', JSON.stringify(dataToSave));
        },
        registerUser(username) {
            this.currentUser = username;
            localStorage.setItem('currentUser', username);
            this.showUserModal = false;
        },
        addTask() {
            if (this.newTask.title && this.currentUser) {
                const task = {
                    ...this.newTask,
                    createdAt: new Date().toLocaleString(),
                    updatedAt: new Date().toLocaleString(),
                    status: '',
                    author: this.currentUser
                };
                this.columns[0].tasks.push(task);
                this.resetNewTask();
                this.showModal = false;
                this.saveData();
            }
            this.editingTaskIndex = null;
            this.editingColumnIndex = null;
        },
        deleteTask(columnIndex, taskIndex) {
            const task = this.columns[columnIndex].tasks[taskIndex];
            if (task.author !== this.currentUser) {
                alert('Вы не можете удалить чужую задачу!');
                return;
            }

            const confirmDelete = confirm(`Вы уверены, что хотите удалить задачу "${task.title}"?`);
            if (confirmDelete) {
                this.columns[columnIndex].tasks.splice(taskIndex, 1);
                this.saveData();
            }
        },
        editTask(columnIndex, taskIndex) {
            const task = this.columns[columnIndex].tasks[taskIndex];
            if (task.author !== this.currentUser) {
                alert('Вы не можете редактировать чужую задачу!');
                return;
            }

            this.newTask = { ...task };
            this.editingTaskIndex = taskIndex;
            this.editingColumnIndex = columnIndex;
            this.showModal = true;
        },
        saveEditedTask() {
            if (this.newTask.title) {
                const task = this.columns[this.editingColumnIndex].tasks[this.editingTaskIndex];
                if (task.author !== this.currentUser) {
                    alert('Вы не можете редактировать чужую задачу!');
                    return;
                }

                Object.assign(task, this.newTask, { updatedAt: new Date().toLocaleString() });
                this.resetNewTask();
                this.showModal = false;
                this.editingTaskIndex = null;
                this.editingColumnIndex = null;
                this.saveData();
            }
        },
        returnTask(columnIndex, taskIndex) {
            const task = this.columns[columnIndex].tasks[taskIndex];
            if (task.author === this.currentUser) {
            }

            this.editingTaskIndex = taskIndex;
            this.editingColumnIndex = columnIndex;
            this.showReturnModal = true;
            this.newTask = { ...task, returnReason: '' };
        },
        confirmReturn() {
            const task = this.columns[this.editingColumnIndex].tasks[this.editingTaskIndex];
            task.returnReason = this.newTask.returnReason || 'Не указана';
            this.moveTask(this.editingColumnIndex, 1, this.editingTaskIndex);
            this.showReturnModal = false;
            this.saveData();
        },
        moveTask(fromColumnIndex, toColumnIndex, taskIndex) {
            const task = this.columns[fromColumnIndex].tasks[taskIndex];

            if (fromColumnIndex === 2 && task.author === this.currentUser) {
            }

            this.columns[fromColumnIndex].tasks.splice(taskIndex, 1);

            if (toColumnIndex === 3) {
                const deadlineDate = new Date(task.deadline);
                const currentDate = new Date();
                task.status = deadlineDate < currentDate ? 'Просроченная' : 'Выполненная в срок';
            }

            this.columns[toColumnIndex].tasks.push(task);
            this.saveData();
        },
        getNextColumnTitle(columnIndex) {
            switch (columnIndex) {
                case 0: return 'В Работу';
                case 1: return 'В Тестирование';
                case 2: return 'Выполнено';
                default: return '';
            }
        },
        resetNewTask() {
            this.newTask = {
                title: '',
                description: '',
                deadline: '',
                returnReason: '',
                author: ''
            };
        },
        openAddTaskModal() {
            if (!this.currentUser) {
                alert('Пожалуйста, войдите в систему, чтобы добавлять задачи!');
                this.showUserModal = true;
                return;
            }
            this.resetNewTask();
            this.editingTaskIndex = null;
            this.editingColumnIndex = null;
            this.showModal = true;
        }
    },
    template: `
        <div>
            <div class="user-section">
                <button v-if="!currentUser" @click="showUserModal = true">Войти</button>
                <div v-else>
                    <span>Пользователь: {{ currentUser }}</span>
                    <button @click="showUserModal = true">Сменить пользователя</button>
                </div>
            </div>

            <div class="kanban-board">
                <column 
                    v-for="(column, columnIndex) in columns" 
                    :key="columnIndex" 
                    :column="column" 
                    :columnIndex="columnIndex" 
                    :addTask="openAddTaskModal" 
                    :getNextColumnTitle="getNextColumnTitle"
                    :currentUser="currentUser"
                    @move-task="moveTask"
                    @edit-task="editTask"
                    @delete-task="deleteTask"
                    @return-task="returnTask"
                ></column>

                <task-return-modal 
                    v-if="showModal || showReturnModal" 
                    :showModal="showModal || showReturnModal" 
                    :newTask="newTask" 
                    :editingTaskIndex="editingTaskIndex" 
                    :returnReason="returnReason" 
                    :isReturn="showReturnModal"
                    :saveTask="editingTaskIndex !== null ? saveEditedTask : addTask" 
                    :confirmReturn="confirmReturn" 
                    :closeModal="() => { showModal = false; showReturnModal = false; }"
                ></task-return-modal>

                <user-modal
                    :showUserModal="showUserModal"
                    :currentUser="currentUser"
                    :closeModal="() => showUserModal = false"
                    :registerUser="registerUser"
                ></user-modal>
            </div>
        </div>
    `
});