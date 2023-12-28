async function loadConfig() {
    const response = await fetch("config.json");
    const jsonData = await response.json();
    window.config = jsonData
    send()
}

async function send() {
    try{
        token = document.cookie.split(";").filter((item) => item.includes("jwt="))[0].split("=")[1]
    }
    catch(e) {
        console.log(e)
        //location.href = "/login.html"
    }
    try {
    var payload = {
        token : token,
        d6_Identifier : location.href.substring(location.href.indexOf("?") + 1)
    }
    } catch (error) {
        payload = {
            d6_Identifier : location.href.substring(location.href.indexOf("?") + 1)
        }
    }

    fetch(window.config.address + "/getInfo", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then( async (response) => {
        if (response.status == 200) {
            jsonData = await response.json()
            console.log(jsonData)
            document.getElementById("card-body").innerHTML = 
            `<header><h5 class="card-title" style="margin-bottom: 0px" >${jsonData.user.name}</h5></header>
            <p style="margin-bottom: 0px" class="card-text"><strong>Country:</strong> ${jsonData.user.country} ${getFlag(jsonData.user.country)}</p>
            <p style="margin-bottom: 0px" class="card-text"><strong>School:</strong> ${jsonData.user.school}</p>
            <p style="margin-bottom: 0px" class="card-text"><strong>Email:</strong> ${jsonData.user.email}</p>
            <p style="margin-bottom: 0px" class="card-text"><strong>Bio:</strong> ${linkifyHtml(jsonData.user.bio.replaceAll("\n","<br>"))}</p>
            <p style="margin-bottom: 0px" class="card-text"><strong>Project:</strong> ${jsonData.user.project}</p>`

        } else if (response.status == 404) {
            document.getElementById("card-body").innerHTML =
            `<h5 class="card-title">User not found!</h5>
            <p style="margin-bottom: 5px" class="card-text">The user you are looking for does not exist!</p>`
        } else {
            response.json().then((json) => {
                //location.href = "/login.html"
            })
        }
    })
    }