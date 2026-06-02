from typing import Annotated
from fastapi import APIRouter, Depends

from auth.model import User
from auth.service import get_current_active_user
from payment.model import PurchaseRequest, TransactionPublic, WalletPublic
from payment import service
from database.core import DBSession

router = APIRouter(prefix="/payment", tags=["payment"])

CurrentUser = Annotated[User, Depends(get_current_active_user)]


@router.get("/wallet", response_model=WalletPublic)
def get_wallet(current_user: CurrentUser, db: DBSession):
    return service.get_my_wallet(db, current_user.id)



@router.post("/transactions", response_model=TransactionPublic)
def purchase(req: PurchaseRequest, current_user: CurrentUser, db: DBSession):
    return service.purchase(db, current_user.id, req)


@router.get("/transactions", response_model=list[TransactionPublic])
def my_transactions(current_user: CurrentUser, db: DBSession):
    return service.get_my_transactions(db, current_user.id)
