async function loadConfig() {
    const response = await fetch("config.json");
    const jsonData = await response.json();
    window.config = jsonData
    send()
}

function send() {
    var searchtype = document.getElementById("searchtype").value
    var search = document.getElementById("search").value
    try {
        token = document.cookie.split(";").filter((item) => item.includes("jwt="))[0].split("=")[1]
    } catch (e) {
        console.log(e)
        location.href = "/login.html"
    }
    fetch(window.config.address + "/getAllUsers", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token
        })
    }).then( async (response) => {
        if (response.status == 200) {
            jsonData = await response.json()
            console.log(jsonData)
            document.getElementById("userlist").innerHTML = ""
            for (var i = 0; i < jsonData.users.length; i++) {
            console.log(jsonData.users[i][searchtype].toLowerCase())
            console.log(search.toLowerCase())
            if (jsonData.users[i][searchtype].toLowerCase().includes(search.toLowerCase())) {
                document.getElementById("userlist").innerHTML += `<div class="card" style="width: 100%; margin-bottom: 10px">
    <div class="card-body">
        <h5 class="card-title">${jsonData.users[i].name}</h5>
        <h6 class="card-subtitle mb-2 text-muted">Email: ${jsonData.users[i].email}</h6>
        <p class="card-text" style="margin-bottom: 0px;"><strong>Country, school:</strong> ${jsonData.users[i].country}, ${jsonData.users[i].school}</p>
        <p class="card-text" style="margin-bottom: 0px;"><strong>Contact sharing code:</strong> ${jsonData.users[i].d6_Identifier}</p>
        <p class="card-text"><strong>Project:</strong> ${jsonData.users[i].project}</p></div></div>`
            }
            }
        } else {
            response.json().then((json) => {
                document.getElementById("output").innerHTML = `<div class="alert alert-danger" role="alert">${json.error}</div>`
            })
        }
    })
}

