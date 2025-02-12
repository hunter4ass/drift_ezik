new Vue({
    el: '#app',
    data: {
        columns: [[], [], []],
        columnLocked: false,
        isAddingCard: false,
        newCardTitle: '',
        newCardItems: [{ text: '' }, { text: '' }, { text: '' }],
        currentColumnIndex: 0,
        currentCard: null, // Для хранения редактируемой карточки
        errorMessage: '',
    },
    template: `
        <div>
            <div class="columns">
                <div class="column" v-for="(column, index) in columns" :key="index">
                    <h2>Столбец {{ index + 1 }}</h2>
                    <div class="card-container">
                        <div class="card" v-for="card in column" :key="card.id">
                            <h3>{{ card.title }}</h3>
                            <ul>
                                <li v-for="(item, itemIndex) in card.items" :key="itemIndex">
                                    <input type="checkbox" v-model="item.completed" @change="updateCard(card)">
                                    {{ item.text }}
                                </li>
                            </ul>
                            <p v-if="card.completedAt">Завершено: {{ card.completedAt }}</p>
                            <button @click="removeCard(column, card)">Удалить карточку</button>
                            <button @click="editCard(card)">Изменить содержание</button>
                        </div>
                    </div>
                    <button v-if="canAddCard(index) && !isColumnLocked(index)" @click="startAddingCard(index)">Добавить карточку</button>
                </div>
            </div>

            <div class="add-card-form" v-if="isAddingCard">
                <h3>{{ currentCard ? 'Изменить карточку' : 'Добавить карточку' }} в Столбец {{ currentColumnIndex + 1 }}</h3>
                <input v-model="newCardTitle" placeholder="Заголовок карточки" />
                <div v-for="(item, index) in newCardItems" :key="index">
                    <input v-model="item.text" placeholder="Текст пункта списка" />
                    <button v-if="newCardItems.length > 3" @click="removeNewItem(index)">Удалить пункт</button>
                </div>
                <button v-if="newCardItems.length < 5" @click="addNewItem">Добавить пункт списка</button>
                <button @click="currentCard ? updateExistingCard() : addNewCard()">{{ currentCard ? 'Сохранить изменения' : 'Подтвердить' }}</button>
                <button @click="cancelAddCard">Отмена</button>
            </div>

            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
        </div>
    `,
    created() {
        this.loadData();
    },
    methods: {
        loadData() {
            const data = JSON.parse(localStorage.getItem('noteAppData'));
            if (data) {
                this.columns = data.columns;
            }
        },
        saveData() {
            localStorage.setItem('noteAppData', JSON.stringify({ columns: this.columns }));
        },
        startAddingCard(columnIndex) {
            this.isAddingCard = true;
            this.newCardTitle = '';
            this.newCardItems = [{ text: '' }, { text: '' }, { text: '' }];
            this.currentColumnIndex = columnIndex;
            this.currentCard = null; // Сбрасываем текущую карточку
            this.errorMessage = '';
        },
        addNewItem() {
            this.newCardItems.push({ text: '' }); // Добавляем новый пустой пункт списка
        },
        removeNewItem(index) {
            this.newCardItems.splice(index, 1); // Удаляем пункт списка по индексу
        },
        addNewCard() {
            const items = this.newCardItems.filter(item => item.text.trim() !== '');
            if (this.newCardTitle.trim() !== '' && items.length >= 3) { // Минимум три пункта
                const newCard = { id: Date.now(), title: this.newCardTitle, items, completedAt: null };
                this.columns[this.currentColumnIndex].push(newCard);
                this.saveData();
                this.cancelAddCard();
            } else {
                this.errorMessage = 'Заполните заголовок карточки и добавьте минимум три пункта списка.';
            }
        },
        cancelAddCard() {
            this.isAddingCard = false;
            this.errorMessage = '';
            this.currentCard = null; // Сбрасываем текущую карточку
        },
        removeCard(column, card) {
            const index = column.indexOf(card);
            if (index > -1) {
                column.splice(index, 1);
                this.saveData();
            }
        },
        editCard(card) {
            this.newCardTitle = card.title;
            this.newCardItems = card.items.map(item => ({ text: item.text }));
            this.isAddingCard = true;
            this.currentColumnIndex = this.columns.findIndex(column => column.includes(card));
            this.currentCard = card; // Устанавливаем редактируемую карточку
            this.errorMessage = '';
        },
        updateExistingCard() {
            const items = this.newCardItems.filter(item => item.text.trim() !== '');
            if (this.newCardTitle.trim() !== '' && items.length >= 3) {
                this.currentCard.title = this.newCardTitle;
                this.currentCard.items = items;
                this.saveData();
                this.cancelAddCard();
            } else {
                this.errorMessage = 'Заполните заголовок карточки и добавьте минимум три пункта списка.';
            }
        },
        updateCard(card) {
            const totalItems = card.items.length;
            const completedItems = card.items.filter(item => item.completed).length;

            if (completedItems > totalItems / 2 && this.columns[0].includes(card)) {
                if (this.columns[1].length >= 5) {
                    this.errorMessage = 'Во втором столбце нет места';
                    return;
                }
                this.moveCard(card, 1);
            } else if (completedItems === totalItems && this.columns[1].includes(card)) {
                this.moveCard(card, 2);
            }

            this.checkColumnLock();
            this.saveData();
        },
        moveCard(card, targetColumnIndex) {
            const sourceColumnIndex = this.columns.findIndex(column => column.includes(card));
            if (sourceColumnIndex !== -1) {
                this.columns[sourceColumnIndex].splice(this.columns[sourceColumnIndex].indexOf(card), 1);
                this.columns[targetColumnIndex].push(card);
            }
        },
        checkColumnLock() {
            this.columnLocked = this.columns[1].length >= 5;
        },
        canAddCard(index) {
            if (this.columnLocked && index === 0) return false;
            if (index === 0) {
                return this.columns[index].length < 3;
            } else if (index === 1) {
                return this.columns[index].length < 5;
            }
            return true;
        },
        isColumnLocked(index) {
            return this.columnLocked && index === 0;
        }
    }
});