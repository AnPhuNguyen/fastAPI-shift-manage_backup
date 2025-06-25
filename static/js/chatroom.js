function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
};

document.addEventListener('DOMContentLoaded', () => {
    // Redirect to login page if not logged in
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
            else if (accessRight === "staff"){
                window.location.href = '/staff'
            }
        })
    }
});

var client_id = Date.now()
document.querySelector("#ws-id").textContent = client_id;
//url socket for only localmachine port 8000: `ws://localhost:8000/ws/${client_id}`
var ws = new WebSocket(`ws://${window.location.host}/ws/${client_id}`);
function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
ws.onmessage = function (event) {
    var messages = document.getElementById('messages')
    var message = document.createElement('li')
    var content = document.createTextNode(event.data)
    message.appendChild(content)
    messages.appendChild(message)

    //bottom part here is show time of sending messages, though it would also affect history chat
    var sendTime = document.createElement('h6')
    var sendTimeContent = document.createTextNode(formatDateTime(new Date()))
    sendTime.appendChild(sendTimeContent)
    messages.appendChild(sendTime)
};
function sendMessage(event) {
    var input = document.getElementById("messageText")
    ws.send(input.value)
    input.value = ''
    event.preventDefault()
}