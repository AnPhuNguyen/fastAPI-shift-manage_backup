// shifts = {
//     "monday": {"sang":true,"chieu":false,"toi":false},
//     "tuesday": {"sang":false,"chieu":true,"toi":false},
//     "wednesday": {"sang":false,"chieu":false,"toi":true},
//     "thursday": {"sang":true,"chieu":true,"toi":false},
//     "friday": {"sang":false,"chieu":true,"toi":true},
//     "saturday": {"sang":true,"chieu":false,"toi":true},
//     "sunday": {"sang":true,"chieu":true,"toi":true}
// }

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
};

function getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!localStorage.getItem('access_token')) {
        window.location.href = '/';
    }
    
    

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
    if (!localStorage.getItem('access_token')){
        shifts = {
            "monday": {"sang":false,"chieu":false,"toi":false},
            "tuesday": {"sang":false,"chieu":false,"toi":false},
            "wednesday": {"sang":false,"chieu":false,"toi":false},
            "thursday": {"sang":false,"chieu":false,"toi":false},
            "friday": {"sang":false,"chieu":false,"toi":false},
            "saturday": {"sang":false,"chieu":false,"toi":false},
            "sunday": {"sang":false,"chieu":false,"toi":false}
        }
    }
    else{
        const decoded = parseJwt(localStorage.getItem('access_token'));
        const infoHolder = document.getElementById('userInfo');
        const username = decoded.user_name;
        const password = decoded.password;
        try {
            // console.log("\ndang gui request get\n")
            const response = await fetch('/me', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_name: username, password: password })
            });
            // console.log('\n de xem co ket qua:\n')
            if (!response.ok){
                // console.log("\nrequest NOT ok\n")
                console.error("chưa lấy thông tin người dùng được...")
            }
            else{
                // console.log("\nrequest ok\n")
                const info = await response.json()
                // ${info.memberID} 
                try {
                    const response2 = await fetch('/shifts', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ memberID: info.memberID})
                    });
                    shifts = await response2.json()
                } catch (error) {
                    console.error(error)
                }

                // shifts = await response2.json()
            }
    
        } catch (error) {
            console.error('Error:', error);
            infoHolder.textContent = "chưa lấy thông tin người dùng được..."
        }
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
});

// // Apply green background for shifts marked true
// const shiftPeriods = ['sang', 'chieu', 'toi'];
// const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// dayNames.forEach((dayName, dayIndex) => {
//     shiftPeriods.forEach((period, periodIndex) => {
//         if (shifts[dayName] && shifts[dayName][period]) {
//             const table = document.querySelector('table');
//             if (table) {
//                 // rows: 0=header,1=dateRow,2=sang,3=chieu,4=toi
//                 const row = table.rows[periodIndex + 2];
//                 if (row && row.cells.length > dayIndex + 1) {
//                     row.cells[dayIndex + 1].style.backgroundColor = 'green';
//                 }
//             }
//         }
//     });
// });