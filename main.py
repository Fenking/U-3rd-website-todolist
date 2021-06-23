from fastapi import FastAPI, Body, Response
from starlette.status import HTTP_204_NO_CONTENT, HTTP_404_NOT_FOUND, HTTP_201_CREATED
from databases import Database
import sqlite3
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORSサポートを追加する．
# ここから
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*']
)

# ここまで


# methodとendpointの指定．サーバの動作確認用．
@app.get('/')
async def hello():
    return {"text": "hello world!"}

# database
DATABASE_URL = 'sqlite:///db/database.db'
# SQLiteではBooleanは0か1の整数として扱われる．booleanとして取り出せるようにする．
sqlite3.register_converter('boolean', lambda v: v != b'0')

database = Database(DATABASE_URL, detect_types=sqlite3.PARSE_DECLTYPES)


# サーバが起動した時にデータベースに接続する．
@app.on_event("startup")
async def startup():
    await database.connect()


# サーバが終了する時にデータベースの接続を外す．
@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


# /todo/init にPOSTのリクエストを送ると，データベースのテーブルを初期化することにする．
@app.post('/todo/init')
async def init_db():
    await database.execute('DROP TABLE IF EXISTS todo')
    await database.execute('CREATE TABLE todo (id INTEGER PRIMARY KEY, task TEXT, completed BOOLEAN, level INTEGER, time TEXT, details TEXT, display BOOLEAN)')
    return Response(status_code=HTTP_204_NO_CONTENT)


# ToDoアプリ用のWeb API
# GET /todo タスクの一覧を返す．
# ここから
@app.get('/todo')
async def todo_items():
    query='SELECT * FROM todo'
    items=await database.fetch_all(query)
    return items

# ここまで


# GET /todo/{id} idのタスクを返す．存在しない場合はNot Found (404)を返す．
# ここから
@app.get('/todo/{id}')
async def todo_get(id:int):
    query='SELECT * FROM todo WHERE id = :id'
    item=await database.fetch_one(query=query,values={'id':id})
    if item is None:
        return Response(status_code=HTTP_404_NOT_FOUND)
    else:
        return item

# ここまで


# POST /todo 新たなタスクを追加する．
# ここから
@app.post('/todo')
async def todo_new(task:str=Body(...),completed:bool=Body(...),level:int=Body(...),time:str=Body(...),
                    details:str=Body(...),display:bool=Body(...)):
    query='INSERT INTO todo (task,completed,level,time,details,display) VALUES(:task,:completed,:level,:time,:details,:display)'
    lastrowid=await database.execute(query=query,values={'task':task,'completed':completed,'level':level,'time':time,
                    'details':details,'display':display})
    response=Response(status_code=HTTP_201_CREATED)
    response.headers['Location']=f'/todo/{lastrowid}'
    return response

# ここまで


# PUT /todo/{id} idのタスクの内容を更新する．そのようなタスクが存在しない場合はNot Found (404)を返す．
# ここから
@app.put('/todo/{id}')
async def todo_update(id:int,task:str=Body(...),completed:bool=Body(...),level:int=Body(...),time:str=Body(...),
                        details:str=Body(...),display:bool=Body(...)):
    query='UPDATE todo SET task=:task,completed=:completed,level=:level,time=:time,details=:details,display=:display WHERE id=:id'
    rowcount=await database.execute(query=query,values={'task':task,'completed':completed,'level':level,'time':time,
                    'details':details,'display':display, 'id':id})
    if rowcount==0:
        return Response(status_code=HTTP_404_NOT_FOUND)
    else:
        return Response(status_code=HTTP_204_NO_CONTENT)

# ここまで


# DELETE /todo/{id} idのタスクを削除する．そのようなタスクが存在しない場合はNot Found (404)を返す．
# ここから
@app.delete('/todo/{id}')
async def todo_delete(id:int):
    query='DELETE FROM todo WHERE id=:id'
    rowcount=await database.execute(query=query,values={'id':id})
    if rowcount==0:
        return Response(status_code=HTTP_404_NOT_FOUND)
    else:
        return Response(status_code=HTTP_204_NO_CONTENT)

# ここまで

# ToDoアプリ用のWeb APIここまで


# チャットボットの例
# オオム返しをするボット．
#  最初はこれまで受け取ったメッセージ数とともにメッセージをそのまま返す．
#  次は逆転されたメッセージを返す．
#  その次は無視する．
# これを繰り返す．

# ユーザごとのコンテキストを保持する．
contexts = {}


# ユーザごとのコンテキストを表現するクラス．メッセージの数をカウントしている．
class EchoBotContext():
    def __init__(self):
        self.count = 0

    def count_up(self):
        self.count += 1
        return self.count

    # レスポンスを返す．
    def response(self, text):
        self.count_up()
        if self.count % 3 == 1:
            # count数とテキストを返す
            return f'Echo ({self.count}) {text}'
        elif self.count % 3 == 2:
            # 逆転したテキストを返す
            return f'Reversed {text[::-1]}'
        else:
            # Noneを返す．(無視を表している）
            return None


# ユーザに対応したコンテキストを返す．
def get_context(username):
    if username not in contexts:
        # コンテキストがなければ，新しいコンテキストを作成する．
        contexts[username] = EchoBotContext()
    return contexts[username]


# チャットボットのコールバックのAPI
@app.post('/bot')
def bot_callback(username: str = Body(..., alias='from'), body: str = Body(...)):
    reply = get_context(username).response(body)
    return {} if reply is None else {'body': reply}
