import { domManager } from "../view/domManager.js";
import {cardsManager} from "../controller/cardsManager.js";



export const htmlTemplates = {
    board: 1,
    card: 2
}

export function htmlFactory(template) {
    switch (template) {
        case htmlTemplates.board:
            return boardBuilder
        case htmlTemplates.card:
            return cardBuilder
        default:
            console.error("Undefined template: " + template)
            return () => {
                return ""
            }
    }
}

export function inputBuilder(type) {
    let inp = document.createElement("input")
    inp.setAttribute('class', 'rename')
    inp.setAttribute('type', 'text')

    let butt = document.createElement('button')
        butt.setAttribute('class', `rename-${type}`)
        butt.setAttribute('type', 'submit')
        butt.textContent = 'Save'


    return [inp, butt]
}


function boardBuilder(statuses, board) {
    let columns = []
    for (let col of statuses) {
        columns.push(`<div class="board-column">
                    <div class="board-column-title" data-status="${col.id}_${col.board_id}" data-column="${col.id}" data-board="${col.board_id}">${col.title}
                        <button type="button" class="icon-button right fas fa-trash-alt" id="delete_column_${col.id}" style="float: right";></button>
                    </div>

                    <div class="board-column-content" data-status="${col.id}_${col.board_id}" data-board-id="${col.board_id}"></div>
                </div>`)
    }
    return `<div class="board-container">
                <section class="board" data-board-id=${board.id}>
                <div class="board-header"><span id='title' class="board-title" data-board-id=${board.id}>${board.title}<button type="button" class="icon-button right fas fa-trash-alt delete" data-board-id="${board.id}";></button></span></span> 
                    <button type="button" class="board-toggle fas fa-folder" id="archived_cards_${board.id}" data-board-id="${board.id}" data-show="false" style="float: right"></button>       
                    <input type="image" src="../static/down.png" width="20" class="arrow-board-toggle" data-board-id="${board.id}" data-show="false"/>
                </div>
            <div class="board-content" data-board-id="${board.id}">
                <div class="board-columns">` + columns.join('') +

        `</div>
            </div>
                </section>
            </div>`;
}

function cardBuilder(card) {
    return `<div class="card" style="position: relative;" data-card-id="${card.id}" data-card-order="${card.card_order}" draggable="true">${card.title}
<button type="button" class="icon-button right fas fa-archive" id="archive_card_${card.id}" data-card-id="${card.id}"style="float: right"></button>
<button type="button" class="icon-button right" style="float: right;"><i class="fas fa-trash-alt" style="float: right;"></i></button></div>`;
}


let dragged;
let oldDraggedStatus;
let oldCardOrder;
let boardId;
export const makeDroppable = {
    droppableBoards: function(){
        domManager.addEventListenerToMore(".board-column-content", 'dragover', makeDroppable.dragOver)
        domManager.addEventListenerToMore(".board-column-content", 'dragenter', makeDroppable.dragEnter)
        domManager.addEventListenerToMore(".board-column-content", 'dragleave', makeDroppable.dragLeave)
        domManager.addEventListenerToMore(".board-column-content", 'drop', makeDroppable.dragDrop)

    },
    draggableCard: function() {
        domManager.addEventListenerToMore(".card", 'dragstart', makeDroppable.dragStart)
        domManager.addEventListenerToMore(".card", 'dragend', makeDroppable.dragEnd)
    },
    dragStart: function(e){
        dragged = e.target; // ez azért kell, mert ez adja a felkapott card azonosítóját és ezt fogjuk SQL felé továbbadni (py-on keresztül), hogy átírjuk adatbázis részen is azt, hogy melyik oszlopban van
        oldDraggedStatus = dragged.parentElement.parentElement.children[0].dataset.column
        oldCardOrder = dragged.dataset.cardOrder
        boardId = dragged.parentElement.parentElement.children[0].dataset.board
    },
    dragEnd: function(){

    },
    dragOver: function(e){
        e.preventDefault();

    },
    dragEnter: function(){

    },
    dragLeave: function(){

    },
    dragDrop: function(e){
        let cards = document.getElementsByClassName("card")
        e.preventDefault();
        //e.currentTarget az, ahova visszük azt, amit megfogunk
        //.board-column-content -hez kell a targetet hozzátennünk
        // az oszlopokat megfoghatjuk ez alapján: data-status="1_${board.id}"
        let newCardStatus = e.currentTarget.parentElement.children[0].dataset.column// ahová a kártyát letesszük, az az oszlop a táblázatban, aminek a számát átadjuk az SQLnek
        let cardId = dragged.dataset.cardId
        cardsManager.changeCardStatus(cardId, newCardStatus)
        if (!e.target.draggable) { //ha üres oszlop
            e.currentTarget.appendChild(dragged);
            cardsManager.changeCardOrder(cardId, "1")
            cardsManager.changeCardsOrder(oldDraggedStatus, oldCardOrder, boardId, -1)
        }
        else if (!e.target.nextSibling) { //ha utolsó
            e.currentTarget.appendChild(dragged);
            cardsManager.changeCardOrder(cardId, parseInt(e.target.dataset.cardOrder)+1)
            cardsManager.changeCardsOrder(oldDraggedStatus, oldCardOrder, boardId, -1)
        }
        else {
            if (e.target !== dragged) {
                let currentpos = 0, droppedpos = 0;
                for (let it = 0; it < cards.length; it++) {
                    if (dragged === cards[it]) {
                        currentpos = it;
                    }
                    if (e.target === cards[it]) {
                        droppedpos = it;
                    }
                }
                if (currentpos < droppedpos) {
                    e.target.parentNode.insertBefore(dragged, e.target.nextSibling);
                    cardsManager.changeCardOrder(cardId, parseInt(e.target.dataset.cardOrder)+1)
                    cardsManager.changeCardsOrder(newCardStatus, e.target.dataset.cardOrder, boardId, 1)
                } else {
                    e.target.parentNode.insertBefore(dragged, e.target);
                    cardsManager.changeCardOrder(cardId, e.target.dataset.cardOrder)
                    cardsManager.changeCardsOrder(newCardStatus, e.target.dataset.cardOrder, boardId, 1)
                }
                cardsManager.changeCardsOrder(oldDraggedStatus, oldCardOrder, boardId, -1)

            }
        }
    },
};


export function buttonBuilder() {
    return `<button type="button" class='btn btn-outline-dark' data-toggle='modal' data-target='#newBoard'
            id="create_new_board" name="new_board">Create new board</button>`
}

export function addButtonBuilder(type) {
    return `<button type="button" style="margin-right:20px" class="add-${type}">Add ${type} </button>`
}

export function modalBuilder(type) {
    return `<div class="modal" id="${type}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div class="modal-dialog" role="document">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">For create a ${type} choose a name </h5>
                    <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
<!--                    <button type="button" class="btn-close" data-bs-dismiss="modal" style="float: right" aria-label="Close">X</button>-->
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body">
                    <form>
                      <div class="form-group">
                        <label for="new-element-title" class="col-form-label">Title:</label>
                        <input type="text" class="form-control" id="new-element-title">
                      </div>
                    </form>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="create" data-bs-dismiss="modal">Create</button>
                  </div>
                </div>
              </div>
            </div>`
}

export function newColumnBuilder(title, boardId, status) {
    return `<div class="board-column">
                    <div class="board-column-title">${title}
                        <button type="button" class="icon-button right fas fa-trash-alt" id="delete_column_${status}" style="float: right"></button>     
                    </div>    
                    <div class="board-column-content" data-status="${status}_${boardId}"></div>
                </div>`
}

export function archiveContainerBuilder(board, archived_cards) {
    let cards = []
    for (let card of archived_cards) {
        cards.push(`<div class="card" style="position: relative;" data-card-id="${card.id}" draggable="true">${card.title}
                        <button type="button" class="icon-button right fas fa-undo" id="unarchive_card" data-card-id="${card.id}" style="float: right"></button>
                    </div>`)
    }
    return `<div class="archive board-container" data-board-id=${board.id}>
                <section class="board" data-board-id=${board.id} >
                <div class="board-header"><span id='title' class="board-title" data-board-id=${board.id}>Archived cards from ${board.title}</span> 
                   </div>
            <div class="archive-board-content" data-board-id="${board.id}">
                <div class="board-columns">
                <div class="board-column">
                    <div class="board-column-title" ></div>
                    <div class="board-column-content" data-board-id="${board.id}">` + cards.join('') +
        `</div>            
        </div>
            </div>
                </section>
            </div>`;
}