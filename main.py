from fastapi import FastAPI, HTTPException, Depends,WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles

import database as db
from models import ConnectionManager, member, UpdateShift

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
# origins = [
#     "http://localhost:8000",
#     "http://127.0.0.1:8000",
# ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import FileResponse
import os

# Mount frontend static files at /static
app.mount("/static", StaticFiles(directory="static"), name="static")
# ----------------------------------------paths------------------------------------
# Serve index.html at root
@app.get("/")
async def root():
    return FileResponse(os.path.join("static", "index.html"))

# @app.get("/login")
# async def root():
#     return FileResponse(os.path.join("static", "index.html"))

@app.get("/admin")
async def get_admin():
    return FileResponse(os.path.join("static", "admin.html"))

@app.get("/staff")
async def get_staff():
    return FileResponse(os.path.join("static", "staff.html"))

@app.get("/admin/chatroom")
async def to_chat():
    return FileResponse(os.path.join("static", "chatroom.html"))

@app.get("/staff/chatroom")
async def to_chat():
    return FileResponse(os.path.join("static", "chatroom.html"))

@app.get("/admin/check_staff/{staff_id}")
async def check_staff():
    return FileResponse(os.path.join("static", "admin_checkstaff.html"))

#create jwt token
from datetime import datetime, timedelta, timezone
from typing import Optional

SECRET_KEY = "newbie"  # can replace key later
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
# ------------------------------------- jwt token-------------------------------------
import jwt
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
        # datetime.utcnow() can no longer be used since it lacks timezone information
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(user_name:str, password:str):
    user = db.getUser(user_name, password)
    if not user:
        return False
    return user

def validate_and_getInfo(token:str):
    try:
        print(token)
        decode_token:dict = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = decode_token.get("sub")
        exp = decode_token.get("exp")
        if not user_id:
            raise ValueError("user not found in token")
        # Check if token is expired
        if exp is not None:
            current_time = datetime.now(timezone.utc).timestamp()
            if current_time > exp:
                raise HTTPException(status_code=401, detail="Token expired")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

# ----------------------------------- working with endpoint below--------------------

from models import userIn

@app.get("/admin/staffList")
async def get_staffList():
    staffList = db.listUser_staff()
    return staffList

@app.post("/me")
async def getDetail_user(user:userIn):
    detail = db.getUse_detail(user.user_name, user.password)
    # print("\npython")
    # print(detail)
    return detail

@app.post("/me-id")
async def getDetail_user_byid(staff:member):
    detail = db.getUse_detail_byID(staff.memberID)
    return detail

@app.post("/shifts")
async def getShifts(staff:member):
    shifts = db.getShiftTable(staff.memberID)
    return shifts


@app.get("/shift-general")
async def getShift_generalDetail():
    shifts = db.getShiftGeneralInfo()
    return shifts
# @app.post("/shifts_staff_view")
# async def getTimetable(staff:member):
#     timetable = db.getShiftTable(staff.memberID)
#     return timetable

@app.post("/update_shift")
async def updateShift(info:UpdateShift):
    # print("upp...")
    print(info.memberID)
    print(info.day_toChange)
    print(info.change_data)
    db.updateShift(info.memberID,info.day_toChange,info.change_data)
    # print({"message": "update success"})
    return {"message": "update success"}

@app.post("/admin/check_staff/{staff_id}")
async def getShifts_forAdmin(staff:member):
    shifts = db.getShiftTable(staff.memberID)
    return shifts

@app.post("/login")
async def login(user:userIn):
    user_obj = authenticate_user(user.user_name, user.password)
    if not user_obj:
        raise HTTPException(status_code=400, detail="Tên đăng nhập hay mật khẩu sai")
    # print(user_obj)
    user_json = {
        "user_name": user_obj[1],
        "password": user_obj[2],
        "access_right": user_obj[3],
    }
    if user_json.get("access_right") not in ["admin", "staff"]:
        raise HTTPException(status_code=400, detail="Bạn không có quyền truy cập")
    ACCESS_TOKEN_EXPIRE = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(user_json, ACCESS_TOKEN_EXPIRE)
    print(access_token)
    return {"access_token":access_token, "token_type": "bearer"}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# @app.get("/user/me", response_model=userOut)
# def get_current_user(token:str = Depends(oauth2_scheme)):
#     user_id = validate_and_getInfo(token)
#     if user_id is None:
#         raise HTTPException(status_code=400, detail="user not found")
#     return user_id

# @app.post("/signup")
# async def signup(user:userIn):
#     if db.getUser(user.user_name, user.password) is not None:
#         raise HTTPException(status_code=400, detail="user already exists")
#     if not user.user_name or not user.password:
#         raise HTTPException(status_code=400, detail="username / password is required")
#     if len(user.user_name) > 50 or len(user.password) > 50:
#         raise HTTPException(status_code=400, detail="username / password cannot have over 50 charaters")
#     db.addUser(user.user_name, user.password)
#     return {"message": "user created successfully"}


manager = ConnectionManager()
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try: 
        rows = db.getAllMessages()
        for row in rows:
            await manager.send_personal_message(f"{row[1]} - {row[0]}", websocket)
        while True:
            data = await websocket.receive_text()
            message = f"Client #{client_id} : {data}"
            # await manager.send_personal_message(f"You wrote: {data}", websocket)
            await manager.broadcast(message)
            db.addMessage(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"Client #{client_id} has left the chat")
