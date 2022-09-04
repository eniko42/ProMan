import {dataHandler} from "../data/dataHandler.js";
import {postData} from "../data/dataHandler.js";
import {htmlFactory, htmlTemplates, makeDroppable} from "../view/htmlFactory.js";
import {domManager} from "../view/domManager.js";

export let cardsManager = {
    loadCards: async function (boardId) {
        const cards = await dataHandler.getCardsByBoardId(boardId);
        for (let card of cards) {
            const cardBuilder = htmlFactory(htmlTemplates.card);
            const content = cardBuilder(card);
            domManager.addChild(`.board-column-content[data-status="${card['status_id']}_${boardId}"]`, content);
            makeDroppable.draggableCard();
            domManager.addEventListener(
                `.card[data-card-id="${card.id}"]`,
                "click",
                deleteButtonHandler
            );
        }
    },

    changeCardStatus: function (cardId, cardStatus) {
        let dict = {'card_id': cardId, 'card_status': cardStatus}
        postData('/api/change_card_status', dict)
    },

  changeCardOrder: function (cardId, cardOrder, cardStatus ) {
    let data = {'card_id': cardId, 'order_status': cardOrder, 'card_status': cardStatus}
      postData('/api/change_card_order', data)
    },
};

function deleteButtonHandler(clickEvent) {
}
