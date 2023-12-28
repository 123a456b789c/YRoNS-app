async function message_send(id) {
    try{
        token = document.cookie.split(";").filter((item) => item.includes("jwt="))[0].split("=")[1]
    }
    catch(e) {
        console.log(e)
        location.href = "/login.html"
    }
    var title = document.getElementById("message_title").value
    var message = document.getElementById("message_message").value
    var prior = document.getElementById("message_prior").value
    fetch(window.config.address + "/sendMessage", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token : token,
            title: title,
            message: message,
            prior: prior
        })
    }).then( async (response) => {
        if (response.status == 200) {
            jsonData = await response.json()
            document.getElementById("message_title").value = ""
            document.getElementById("message_message").value = ""
            closeModalbyId(id)
        } else {
            response.json().then((json) => {
            document.getElementById("message_output").innerHTML = `<article><p style="color: #cb3b3b; margin-bottom: 0px">${json.error}</p></article>`
            })
        }
    })

    }