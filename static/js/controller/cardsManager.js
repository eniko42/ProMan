import {dataHandler} from "../data/dataHandler.js";
import {postData} from "../data/dataHandler.js";
import {htmlFactory, htmlTemplates, inputBuilder, makeDroppable} from "../view/htmlFactory.js";
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
                "dblclick",
                renameCard

            );
             domManager.addEventListenerToMore(
                `.fa-trash-alt`,
                "click",
                deleteButtonHandler
             );
             domManager.addEventListenerToMore(
                `.fa-archive`,
                "click",
                archiveButtonHandler
             );
        }
    },

    changeCardStatus: function (cardId, cardStatus) {
        let dict = {'card_id': cardId, 'card_status': cardStatus}
        postData('/api/change_card_status', dict)
    },

    changeCardOrder: function (cardId, cardOrder) {
    let data = {'card_id': cardId, 'order_status': cardOrder}
      postData('/api/change_card_order', data)
    },

    changeCardsOrder: function (cardStatus, cardOrder, boardId, status) {
    let data = {'card_status': cardStatus, 'order_status': cardOrder, 'board_status': boardId, 'status': status}
      postData('/api/change_card_order', data)
    },

};


async function archiveButtonHandler(clickEvent) {
    let cardId = clickEvent.target.dataset.cardId
    await dataHandler.archiveCard(cardId)
    let targetCard = clickEvent.target.parentElement
    targetCard.remove()
}



function deleteButtonHandler(clickEvent) {
    let cardId = clickEvent.target.parentElement.parentElement.dataset.cardId
    let actualCard = clickEvent.target.parentElement.parentElement
    actualCard.remove();
    dataHandler.deleteCard(cardId);

}

function renameCard(clickEvent) {
        const cardId = clickEvent.target.dataset.cardId;
        let actualCard = clickEvent.target
        actualCard.style.visibility = 'hidden'
        const inputbar = inputBuilder('card')
        let parent = clickEvent.target.parentElement
        parent.insertBefore(inputbar[0], actualCard)
        parent.insertBefore(inputbar[1], actualCard)

        let ignoreClickOnMeElement = inputbar[0]
        document.addEventListener('click', isOutside)

        domManager.addEventListener('.rename-card', 'click', async function () {
                let newStatus = inputbar[0].value //input mező
                await dataHandler.renameCard(cardId, newStatus)
                actualCard.textContent = newStatus
                inputbar[0].remove() //input field
                inputbar[1].remove() //button
                actualCard.style.visibility = 'visible'
                document.removeEventListener('click', isOutside)
            }
        )

        function isOutside(event) {
            if ((event.target) !== ignoreClickOnMeElement) {
                document.removeEventListener('click', isOutside)
                inputbar[0].remove() //input field
                inputbar[1].remove() //button
                actualCard.style.visibility = 'visible'

            }
        }

}
