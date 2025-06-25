import random
import string
import pyodbc
# connect to a database (this method was studied from official documentation of MS SQL Server)
def connect():
    DRIVER = '{ODBC Driver 17 for SQL Server}'
    SERVER = 'DESKTOP-24QOS1E'
    DATABASE = 'shifrManage_api'
    USERNAME = 'sa'
    PASSWORD = '12345678'
    connectionString = f'DRIVER={DRIVER};SERVER={SERVER};DATABASE={DATABASE};UID={USERNAME};PWD={PASSWORD}'
    conn = pyodbc.connect(connectionString)
    # print("ok")
    return conn 

con = connect()
cursor = con.cursor()

# randomly generate an id for the user when adding new user
def id_gen():
    first_char = 'U'
    digits = ''.join(random.choices(string.digits, k=9))
    result = first_char + digits
    cursor.execute("SELECT * FROM [dbo].[user] WHERE user_id = ?", result)
    if (cursor.fetchone() is not None):
        return id_gen() # redo func if id is already in use
    return result

# add new user to database
def addUser(name:str, password:str):
    if (len(name)>50):
        print("name cannot exceed 50 characters here")
        return
    if (len(password)>50):
        print("password cannot exceed 50 characters here")
        return
    sql="INSERT INTO [dbo].[user] (user_id, user_name, password) VALUES (?, ?, ?)"
    cursor.execute(sql, id_gen(), name, password)
    cursor.commit()
    print("\nuser added\n")

# show all users in database (console-side for devs)
def listUser_staff():
    sql = '''
    SELECT tv.memberID,tv.name,tv.vi_tri from [dbo].[thanh_vien] tv
join [dbo].[tai_khoan] tk on tv.accountID=tk.accountID
where tk.quyen = 'staff'
    '''
    cursor.execute(sql)
    rows = cursor.fetchall()
    if rows is None:
        print("no users")
        return
    staffList={}
    index:int = 0
    for row in rows:
        tempDict = {}
        tempDict['staff_id'] = row[0]
        tempDict['staff_name'] = row[1]
        tempDict['staff_role'] = row[2]
        # x = f"{row[0]}: {row[1]} - {row[2]}"
        staffList.update({index : tempDict})
        index += 1
    return staffList

# get a user's infos. also check if user exist whether a set was returned or not
def getUser(name:str,password:str):
    sql = "SELECT * FROM tai_khoan WHERE ten_dangnhap = ? AND mat_khau = ?"
    cursor.execute(sql,name,password)
    rows = cursor.fetchone()
    return rows

def getUse_detail_byID(memberID:str):
    cursor.execute("select * from thanh_vien where memberID = ?",memberID)
    row = cursor.fetchone()
    detail = {
        "memberID": row[0],
        "ten": row[1],
        "vi_tri": row[2]
    }
    return detail

def getUse_detail(name:str, password:str):
    sql='''
    SELECT tv.memberID,tv.name,tv.vi_tri from [dbo].[thanh_vien] tv
join [dbo].[tai_khoan] tk on tv.accountID=tk.accountID
where tk.ten_dangnhap = ? and tk.mat_khau = ?
    '''
    cursor.execute(sql, name, password)
    row = cursor.fetchone()
    detail = {
        "memberID": row[0],
        "ten": row[1],
        "vi_tri": row[2]
    }
    return detail

# delete user (console-side for devs, or be used in a function in future)
def deleteUser(id:string):
    cursor.execute("DELETE FROM [dbo].[tai_khoan] WHERE accountID = ?", id)
    cursor.commit()

def updateShift(memberID:str, day_toChange:str, change_data:str):
    # Validate day_toChange against allowed column names to prevent SQL injection
    allowed_columns = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    if day_toChange not in allowed_columns:
        raise ValueError("Invalid day_toChange column")

    sql = f'''
    UPDATE [dbo].[nhan_vien_ca_lam]
    SET {day_toChange} = ?
    WHERE memberID = ?
    '''
    cursor.execute(sql, change_data, memberID)
    cursor.commit()


# get shift table of a staff member
def getShiftTable(staffID:str):
#     sql = '''
#     SELECT * from nhan_vien_ca_lam shiftTB
# where shiftTB.memberID in (
# select tv.memberID from thanh_vien tv
# join tai_khoan tk on tk.accountID = tv.accountID
# where tv.memberID=shiftTB.memberID and tk.quyen = 'staff'
# )
#     '''
    sql = 'SELECT * from nhan_vien_ca_lam where memberID = ?'
    cursor.execute(sql,staffID)
    rows = list(cursor.fetchone())
    days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    shifts = {}
    for day in days:
        shifts.update({day:{"sang":False, "chieu":False, "toi":False}})
    if rows is None:
        return shifts

    for index in range(len(rows)):
        if (index == 0): continue
        if (rows[index] == None):
            periods = None
            continue
        else:    
            periods = str(rows[index]).split(",")
        # print(periods)
        
            j = index-1
            for p in periods:
                p = p.strip().lower()
                for key in shifts:
                    if key not in days[j]: continue
                    for subkey in shifts[key]:
                        if subkey == p:
                            shifts[key][subkey] = True
    
    # for i in shifts:
    #     print(f"{i} -> {shifts[i]}")
    return shifts

#get shift general info
def getShiftGeneralInfo():
    cursor.execute("select * from ca_lam")
    timetable = cursor.fetchall()
    tableDict = {}
    for row in timetable:
        startHour = row[1].strftime("%H:%M:%S")
        endHour = row[2].strftime("%H:%M:%S")
        tableDict.update({row[0]:{'start':startHour, 'end':endHour}})
    return tableDict

# work with message in public chat room
import datetime

def addMessage(msg:string):
    x = datetime.datetime.now()
    formatted_date_time = x.strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("insert into chat_store (message, send_time) values (?, ?)", msg, formatted_date_time)
    cursor.commit()
    # print(f"message added at {formatted_date_time}")

def getAllMessages():
    sql = '''
SELECT TOP (1000) [message]
      ,[send_time]
  FROM [shifrManage_api].[dbo].[chat_store]
  Order by send_time    
    '''
    cursor.execute(sql)
    rows = cursor.fetchall()
    return rows

if __name__=="__main__":
    x = getShiftGeneralInfo()
    print(x)