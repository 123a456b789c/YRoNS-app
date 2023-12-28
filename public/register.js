async function loadCountries() {
    const response = await fetch(window.config.address + "/countries");
    const jsonData = await response.json();
    document.getElementById("country").innerHTML = ""
    for (let i = 0; i < jsonData.length; i++) {
        document.getElementById("country").innerHTML += "<option value=\"" + jsonData[i].name + "\">" + jsonData[i].name + "</option>"
    }
}

async function loadSchools() {
    const response = await fetch(window.config.address + "/schools");
    const jsonData = await response.json();
    document.getElementById("school").innerHTML = ""
    window.schools = jsonData
    for (let i = 0; i < jsonData.length; i++) {
        document.getElementById("school").innerHTML += "<option value=\"" + jsonData[i].name + "\">" + jsonData[i].name + "</option>"
    } 
}

async function loadConfig() {
    const response = await fetch("config.json");
    const jsonData = await response.json();
    window.config = jsonData
    loadCountries()
    loadSchools()
document.getElementById("school").addEventListener("change", () => {
    var school = document.getElementById("school").value
    for (var i = 0; i < window.schools.length; i++) {
        if (window.schools[i].name == school) {
            document.getElementById("country").value = window.schools[i].country
        }
    }
});
}

function send() {
    var name = document.getElementById("name").value
    var email = document.getElementById("email").value
    var country = document.getElementById("country").value
    var school = document.getElementById("school").value
    var project = document.getElementById("project").value
    var bio = document.getElementById("bio").value
    var passkey = document.getElementById("passkey").value
    fetch(window.config.address + "/register", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name : name,
            email : email,
            country : country,
            school : school,
            project : project,
            bio : bio,
            passkey : passkey
        })
    }).then((response) => {
        if (response.status == 200) {
          document.getElementById("output").innerHTML = `<article><p style="color: green; margin-bottom: 0px">You have been registered successfully!</p></article>`
          document.getElementById("output").scrollIntoView()
        } else {
            response.json().then((json) => {
                document.getElementById("output").innerHTML = `<article><p style="color: #cb3b3b; margin-bottom: 0px">${json.error}</p></article>`
                document.getElementById("output").scrollIntoView()
            })
        }
    })
    document.getElementById("bio").value = ""
    document.getElementById("name").value = ""
    document.getElementById("email").value = ""
    document.getElementById("passkey").value = ""
    document.getElementById("project").value = ""
}

