# Webアプリケーション 雛形

## Node.js 
Node.jsの処理系をインストールしておく．
### Webサーバのインストール
必要なライブラリをインストールする．
```shell
npm install
```
### バンドラーの起動
Reactをプログラムを変換するためにここではParcelを使用している．
Parcelのバンドラーをバックグランドで動かしておく．
```shell
npm run dev
```
### Webサーバの起動
```shell
npm run start
```

`http://localhost:3000/` でアクセスできる．

## FastAPI 
Web API実験用に別サーバを立ち上げる．ここではPythonで記述されたFastAPIを使用している．
Pythonの仮想環境を作成することを推奨する．

### インストール
```shell
python -m pip install -r requirements.txt
```
### Webサーバの起動
```shell
uvicorn main:app --reload
```
`http://localshot:8000/` でアクセスできる．
雛形のプログラムでは，SQLiteのデータベースを利用している．
データベースのファイルは，`db/database.db`に置いている．