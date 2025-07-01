# PaperKeep

To start a WSGI server using mod_wsgi-express:
`C:\Users\Medieval\AppData\Roaming\Python\Python312\Scripts\mod_wsgi-express.exe start-server your_wsgi_app.wsgi`


Each user's first 6 user categories is created as the user signs up(main/auth/firebase.py)

Install node.js and npm
Install postgreSQL and create a password


run: "c:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres
enter the password upon installation of postgreSQL
run: CREATE USER paperkeepAdmin WITH PASSWORD '123';
run: CREATE DATABASE paperkeepDB OWNER paperkeepAdmin;

cd frontend
npm install

go to project root (backend)
python -m venv venv
pip install -r requirements.txt

python manage.py makemigrations
python manage.py migrate
python manage.py loaddata system_categories.json
python manage.py runserver
