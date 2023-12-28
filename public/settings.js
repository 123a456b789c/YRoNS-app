function hydrate_settings() {
    document.getElementById("settings_output").innerHTML = ``
    try{
        token = document.cookie.split(";").filter((item) => item.includes("jwt="))[0].split("=")[1]
    } catch(e) {
        console.log(e)
        location.href = "/login.html"
    }
    console.log(token)
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
            console.log(jsonData)
            document.getElementById("settings_name").value =jsonData.user.name
            document.getElementById("settings_email").value = jsonData.user.email
            document.getElementById("settings_project").value = jsonData.user.project
            document.getElementById("settings_bio").value = jsonData.user.bio
            } else {
            response.json().then((json) => {
                location.href = "/login.html"
            })
        }
    })
}

function send(id) {
    console.log(event)
    try{
        token = document.cookie.split(";").filter((item) => item.includes("jwt="))[0].split("=")[1]
    }
    catch(e) {
        console.log(e)
        location.href = "/login.html"
    }
    var name = document.getElementById("settings_name").value
    var email = document.getElementById("settings_email").value
    var project = document.getElementById("settings_project").value
    var bio = document.getElementById("settings_bio").value
    fetch(window.config.address + "/register", {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token : token,
            name : name,
            email : email,
            project : project,
            bio : bio
        })
    }).then((response) => {
        if (response.status == 200) {
            document.getElementById("settings_output").innerHTML = '<div class="alert alert-success" role="alert">Your profile has been updated successfully!</div>'
            document.getElementById("settings_bio").value = ""
            document.getElementById("settings_name").value = ""
            document.getElementById("settings_email").value = ""
            document.getElementById("settings_project").value = ""
            closeModalbyId(id)
        } else {
            response.json().then((json) => {
                document.getElementById("settings_output").innerHTML = `<article><p style="color: #cb3b3b; margin-bottom: 0px">${json.error}</p></article>`
            })
        }
    })

}

