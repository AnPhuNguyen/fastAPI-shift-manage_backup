from fastapi import WebSocket
from pydantic import BaseModel

class user(BaseModel):
    user_id:str
    user_name:str
    password:str
    access_right:str

class userIn(BaseModel):
    user_name: str
    password: str

class userOut(BaseModel):
    user_id:str
    user_name:str
    job:str

class member(BaseModel):
    memberID:str

class UpdateShift(BaseModel):
    memberID:str
    day_toChange:str
    change_data:str

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)