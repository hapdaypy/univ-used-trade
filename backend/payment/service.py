from fastapi import HTTPException
from sqlmodel import select, text

from auth.model import Wallet
from posts.model import Post
from payment.model import Transaction, PurchaseRequest, TransactionPublic
from database.core import DBSession


def get_my_wallet(db: DBSession, user_id: int) -> Wallet:
    wallet = db.exec(select(Wallet).where(Wallet.user_id == user_id)).first()
    if wallet is None:
        raise HTTPException(status_code=404, detail="지갑이 없습니다.")
    return wallet



def purchase(db: DBSession, buyer_id: int, req: PurchaseRequest) -> TransactionPublic:
    post = db.get(Post, req.post_id)
    if post is None:
        raise HTTPException(status_code=404, detail="게시글이 없습니다.")
    if post.status != "available":
        raise HTTPException(status_code=400, detail="이미 판매 완료된 상품입니다.")
    if post.seller_id == buyer_id:
        raise HTTPException(status_code=400, detail="본인 게시글은 구매할 수 없습니다.")

    chat_room = db.execute(
        text("SELECT id FROM chat_rooms WHERE posts_id = :post_id AND buyer_id = :buyer_id"),
        {"post_id": req.post_id, "buyer_id": buyer_id}
    ).first()
    if chat_room is None:
        db.execute(
            text("INSERT INTO chat_rooms (posts_id, buyer_id) VALUES (:post_id, :buyer_id)"),
            {"post_id": req.post_id, "buyer_id": buyer_id},
        )

    buyer_wallet = get_my_wallet(db, buyer_id)
    if buyer_wallet.money < post.price:
        raise HTTPException(status_code=400, detail="잔액이 부족합니다.")

    seller_wallet = get_my_wallet(db, post.seller_id)

    buyer_wallet.money -= post.price
    seller_wallet.money += post.price
    post.status = "sold"

    db.add(buyer_wallet)
    db.add(seller_wallet)
    db.add(post)

    transaction = Transaction(
        post_id=post.id,
        buyer_id=buyer_id,
        seller_id=post.seller_id,
        amount=post.price,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return to_transaction_public(transaction, post)


def get_my_transactions(db: DBSession, user_id: int) -> list[TransactionPublic]:
    transactions = db.exec(
        select(Transaction).where(
            (Transaction.buyer_id == user_id) | (Transaction.seller_id == user_id)
        )
    ).all()
    posts = {
        post.id: post
        for post in db.exec(
            select(Post).where(Post.id.in_([transaction.post_id for transaction in transactions]))
        ).all()
    } if transactions else {}
    return [to_transaction_public(transaction, posts.get(transaction.post_id)) for transaction in transactions]


def to_transaction_public(transaction: Transaction, post: Post | None) -> TransactionPublic:
    return TransactionPublic(
        id=transaction.id,
        post_id=transaction.post_id,
        buyer_id=transaction.buyer_id,
        seller_id=transaction.seller_id,
        amount=transaction.amount,
        created_at=transaction.created_at,
        post_title=post.title if post else None,
        post_content=post.content if post else None,
    )
