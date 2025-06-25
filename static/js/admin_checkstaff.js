function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
};

document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('access_token')) {
        window.location.href = '/';
    }

    const bactbtn = document.getElementById("goback")
    if (bactbtn){
        bactbtn.addEventListener("click",()=>{
            const decoded = parseJwt(localStorage.getItem('access_token'));
            const accessRight = decoded.access_right;
            if (accessRight === "admin"){
                window.location.href = '/admin'
            }
        })
    }

    const currentUrl = String(window.location.href);
    const slice_pos = currentUrl.indexOf("check_staff/") + 12
    console.log(currentUrl);
    const staff_id = currentUrl.substring(slice_pos, currentUrl.length)
    console.log(staff_id)
    // get info of current staff
    const infoHolder = document.getElementById('staffInfo');
    try {

        const response = await fetch('/me-id', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ memberID: staff_id })
        });
        if (!response.ok) {
            // console.log("\nrequest NOT ok\n")
            console.error(error)
            infoHolder.textContent = "chưa lấy thông tin người dùng được..."
        }
        else {
            const info = await response.json();
            infoHolder.textContent = `
                ${info.memberID}  |  ${info.ten}  |  ${info.vi_tri}
            `
        }

    } catch (error) {
        console.error('Error:', error);
        infoHolder.textContent = "chưa lấy thông tin người dùng được..."
    }

    //paint shift table
    const monday = getMonday(new Date());
    const days = ['monDate', 'tueDate', 'wedDate', 'thuDate', 'friDate', 'satDate', 'sunDate'];

    days.forEach(async (id, index) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + index);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear().toString().slice(-2);
        const formattedDate = `${day}/${month}/${year}`;
        const cell = document.getElementById(id);
        cell.textContent = formattedDate;

        // Highlight current day column cells in row 1 and row 2
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            cell.classList.add('highlight');
            // Highlight the corresponding day name cell in row 1
            const dayIndex = index + 1; // +1 because of the empty first column
            const table = cell.closest('table');
            if (table) {
                const headerRow = table.rows[0];
                if (headerRow && headerRow.cells.length > dayIndex) {
                    headerRow.cells[dayIndex].classList.add('highlight');
                }
            }
        }
    });

    var shifts
    try {
        const response2 = await fetch('/admin/check_staff/{staff_id}', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ memberID: staff_id })
        });
        shifts = await response2.json()
    } catch (error) {
        console.error('Error:', error);
    }
    // Apply green background for shifts marked true
    const shiftPeriods = ['sang', 'chieu', 'toi'];
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    dayNames.forEach((dayName, dayIndex) => {
        shiftPeriods.forEach((period, periodIndex) => {
            if (shifts[dayName] && shifts[dayName][period]) {
                const table = document.querySelector('table');
                if (table) {
                    // rows: 0=header,1=dateRow,2=sang,3=chieu,4=toi
                    const row = table.rows[periodIndex + 2];
                    if (row && row.cells.length > dayIndex + 1) {
                        row.cells[dayIndex + 1].style.backgroundColor = 'green';
                    }
                }
            }
        });
    });

    const changeShift_form = document.getElementById("shiftEdit")
    changeShift_form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const changing_day = document.getElementById('day').value;
        const period_change = document.getElementById('periods').value;
        const id_staff = staff_id //yes, the same id got from extracting the staff_id from the url
        const chekStr = period_change.split(",");
        for (let i = 0; i < chekStr.length; i++){
            chekStr[i] = chekStr[i].trim()
        }
        console.log(changing_day); console.log(period_change)
        console.log(chekStr);

        const dayPeriod = ['sang','chieu','toi',''];
        const errorHold = document.getElementById('error')
        chekStr.forEach(function(data){
            // data = data.trim()
            if (!dayPeriod.includes(data)){
                errorHold.textContent = "có dữ liệu khác 'sang', 'chieu', 'toi' và rỗng"
                throw new Error("có dữ liệu khác 'sang', 'chieu', 'toi' và rỗng");
            }
        });
        
        // sending reques to update shift table
        try {
            const response = await fetch('/update_shift', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ memberID: id_staff, day_toChange: changing_day, change_data: period_change })
            });
            if (!response.ok){
                errorHold.textContent = "yêu cầu thay đổi lịch làm việc chưa được nhận";
            }
            else{
                const reply = await response.json();
                alert(reply.message+" Tải lại trang để xem kết quả")
            }
        } catch (error) {
            errorHold.textContent = "Đã có sự cố khi thay đổi lịch làm việc" ;
            console.error('Error:', error);
        }
    })
});