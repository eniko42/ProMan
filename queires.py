import data_manager
from psycopg2 import sql

def get_card_status(status_id):
    """
    Find the first status matching the given id
    :param status_id:
    :return: str
    """
    status = data_manager.execute_select(
        """
        SELECT * FROM statuses s
        WHERE s.id = %(status_id)s
        ;
        """
        , {"status_id": status_id}, fetchall=True)

    return status


def get_boards():
    """
    Gather all boards
    :return:
    """
    # remove this code once you implement the database
    # return [{"title": "board1", "id": 1}, {"title": "board2", "id": 2}]

    return data_manager.execute_select(
        """
        SELECT * FROM boards
        ;
    
        """
        , fetchall=True
    )


def get_cards_for_board(board_id):
    # remove this code once you implement the database
    # return [{"title": "title1", "id": 1}, {"title": "board2", "id": 2}]

    matching_cards = data_manager.execute_select(
        """
        SELECT * FROM cards
        WHERE cards.board_id = %(board_id)s
        ORDER BY card_order ASC
        ;
        """
        , {"board_id": board_id}, fetchall=True)

    return matching_cards


def write_new_board(title):
    data_manager.execute_select(
        """INSERT INTO boards (title) VALUES (%(title)s)
        returning boards"""
        , {'title': title}, fetchall=True)


def write_new_card(data):
    data_manager.execute_select(
        """INSERT INTO cards (board_id, status_id, title, card_order) VALUES (%(board_id)s, %(status)s, %(title)s, 1)
        returning cards"""
        , {'title': data['title'], 'board_id': data['board_id'], 'status': data['status']}, fetchall=True)


def change_card_status(card_id, board_status):
    data_manager.execute_update("""UPDATE cards
                SET status_id = %(board_status)s
                WHERE  id = %(card_id)s
                """
                , {'board_status': board_status, 'card_id': card_id})


def rename_board(data):
    data_manager.execute_select(sql.SQL(
        """UPDATE {table_name}
        SET {updated_column} = {title_name}
        WHERE {wheree} = {id}
        returning boards"""
    ).format(updated_column=sql.Identifier('title'),
             table_name=sql.Identifier('boards'),
             title_name=sql.Literal(data['title']),
             wheree=sql.Identifier('id'),
             id=sql.Literal(data['id'])
         ))
    return data


def change_card_order(card_id, board_status, order_status):
    data_manager.execute_update("""UPDATE cards
                SET card_order = card_order + 1
                WHERE  card_order >= %(order_status)s AND status_id = %(board_status)s
                """
                , {'order_status': order_status, 'card_id': card_id, 'board_status': board_status})


def get_user_by_email(email_input):
    # data = data_manager.execute_select(sql.SQL(
    #      """SELECT *
    #      FROM {table_name}
    #      WHERE {where} = {email_input}
    #      """
    # ).format(table_name=sql.Identifier('users'),
    #          where=sql.Identifier('username'),
    #          email_input=sql.Literal('email_input')
    #          ))
    # return data

    data = data_manager.execute_select(
        """SELECT *
        FROM users
        WHERE username = %(username)s
        """
        , {'username':email_input}
    )
    return data


def add_new_user(user, password):
    data_manager.execute_update(
        """INSERT INTO users
         (username, password) 
         VALUES 
         (%(user)s, %(password)s)"""
        , {'user':user, 'password':password})


