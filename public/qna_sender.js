async function loadConfig() {
    const response = await fetch("config.json");
    const jsonData = await response.json();
    window.config = jsonData
    loadData()
}



function loadData() {

    try{
        token = document.cookie.split(";").filter((item) => item.includes("jwt="))[0].split("=")[1]
    } catch(e) {
        console.log(e)
        location.href = "/login.html"
    }

fetch(window.config.address + "/getPersonalInfo", {
    method: "POST",
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        token : token
    })
}).then( async (response) => {
    if (response.status == 200) {
        jsonData = await response.json()
        window.personalInfo = jsonData
        console.log(jsonData)
        document.getElementById("sender").textContent +=  " (as " + jsonData.user.name + ")"
        } else {
        response.json().then((json) => {
        location.href = "/login.html"
        })
    }
})
}

function sendMessage() {
    try{
        token = document.cookie.split(";").filter((item) => item.includes("jwt="))[0].split("=")[1]
    } catch(e) {
        console.log(e)
        location.href = "/login.html"
    }

    var message = document.getElementById("message").value
    if (message.length < 1) {
        document.getElementById("output").innerHTML = `<article><p style="color: #cb3b3b; margin-bottom: 0px">Please enter a message!</p></article>`
        return
    }
    var country = window.personalInfo.user.country
    var school = window.personalInfo.user.school
    var sender = window.personalInfo.user.name
    fetch(window.config.address + "/sendQnaMessage", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: token,
            message: message,
            country: country,
            school: school,
            sender: sender
        })
    }).then( async (response) => {
        if (response.status == 200) {
            document.getElementById("output").innerHTML = '<article><p style="color: #3bcb4e; margin-bottom: 0px">Message sent!</p></article>';
            document.getElementById("message").value = ""
        } else {
            response.json().then((json) => {
                document.getElementById("output").innerHTML = `<article><p style="color: #cb3b3b; margin-bottom: 0px">Please enter a message!</p></article>`
            })
        }
    }
    )
}



