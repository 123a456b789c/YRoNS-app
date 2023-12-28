async function loadConfig() {
    const response = await fetch("config.json");
    const jsonData = await response.json();
    window.config = jsonData
    document.getElementById("loginbutton").ariaBusy = false
}

function send() {
    var email = document.getElementById("email").value
    var passkey = document.getElementById("passkey").value
    fetch(window.config.address + "/login", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email : email,
            passkey : passkey
        })
    }).then( async (response) => {
        if (response.status == 200) {
            jsonData = await response.json()
            var expires =  new Date(Date.now() + 1000 * 60 * 60 * 24 * 1)
            document.getElementById("loginbutton").ariaBusy = true
            document.cookie = "jwt=" + jsonData.token + ";expires=" + expires + ";path=/"
            window.location.href = "/dashboard.html"
        } else {
            document.getElementById("email").ariaInvalid = true
            document.getElementById("passkey").ariaInvalid = true
        }
    })

    document.getElementById("email").value = ""
    document.getElementById("passkey").value = ""
}

