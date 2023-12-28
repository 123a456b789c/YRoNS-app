async function loadConfig() {
    const response = await fetch("config.json");
    const jsonData = await response.json();
    window.config = jsonData
    send()
}

function send() {
    let masterPassword = prompt("Enter master password!", "masterpassword");
    if (masterPassword == null || masterPassword == "") {
      alert("No valid data")
      send()
      return
    }
    fetch(window.config.address + "/map_places/" + masterPassword, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then( async (response) => {
        if (response.status != 200) {
            alert("Invalid credentials!")
            send()
            return
        }
        var jsonData = await response.json()
        var table = document.getElementById("map_places")
        table.innerHTML = ""
        for (var i = 0; i < jsonData.length; i++) {
            table.innerHTML += `<tr><td>${jsonData[i].name}</td><td>${jsonData[i].description}</td><td>${jsonData[i].lat}</td><td>${jsonData[i].long}</td><td><a style="color: red" onclick="deleteMap(${jsonData[i].id})">Delete</a></td></tr>`
        }
    })
    fetch(window.config.address + "/events/" + masterPassword, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then( async (response) => {
        if (response.status != 200) {
            alert("Invalid credentials!")
            send()
            return
        }
        var jsonData = await response.json()
        jsonData = jsonData.events
        var table = document.getElementById("events")
        table.innerHTML = ""
        for (var i = 0; i < jsonData.length; i++) {
            console.log(jsonData[i])
            table.innerHTML += `<tr><td>${jsonData[i].name}</td><td>${jsonData[i].description}</td><td>${jsonData[i].start_date}</td><td>${jsonData[i].end_date}</td><td>${jsonData[i].place}</td><td style="color: red" onclick="deleteEvent(${jsonData[i].id})">Delete</td></tr>`
        }
    }
    )
}

function sendMap() {
    let masterPassword = prompt("Enter master password!", "masterpassword");
    if (masterPassword == null || masterPassword == "") {
      alert("No valid data")
      send()
      return
    }
    let name = prompt("name=", "name");
    if (name == null || name == "") {
        alert("No valid data")
        send()
        return
    }
    let description = prompt("description=", "description");
    if (description == null || description == "") {
        alert("No valid data")
        send()
        return
    }
    let lat = prompt("lat=", "lat");
    if (lat == null || lat == "") {
        alert("No valid data")
        send()
        return
    }
    let long = prompt("long=", "long");
    if (long == null || long == "") {
        alert("No valid data")
        send()
        return
    }
    fetch(window.config.address + "/map_places/" + masterPassword, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            description: description,
            lat: lat,
            long: long
        })            
    }).then( async (response) => {
        if (response.status != 200) {
            alert("Invalid credentials!")
            console.log(await response.json())
            send()
            return
        }
        document.getElementById("output").innerHTML = `<div class="alert alert-success" role="alert">Sent!</div>`
        if (confirm("Reload data?")) {
            send()
        }
    })
}

function deleteMap(id) {
    let masterPassword = prompt("Enter master password!", "masterpassword");
    if (masterPassword == null || masterPassword == "") {
        alert("No valid data")
        send()
        return
    }
    fetch(window.config.address + "/map_places/" + masterPassword + "/" + id, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then( async (response) => {
        if (response.status != 200) {
            alert("Invalid credentials!")
            console.log(await response.json())
            send()
            return
        } else {
            document.getElementById("output").innerHTML = `<div class="alert alert-success" role="alert">Sent!</div>`
        }
        if (confirm("Reload data?")) {
            send()
        }
    })
}

function sendEvent() {
    let masterPassword = prompt("Enter master password!", "masterpassword");
    if (masterPassword == null || masterPassword == "") {
      alert("No valid data")
      send()
      return
    }
    let name = prompt("name=", "name");
    if (name == null || name == "") {
        alert("No valid data")
        send()
        return
    }
    let description = prompt("description=", "description");
    if (description == null || description == "") {
        alert("No valid data")
        send()
        return
    }
    let start_date = prompt("start_date=", new Date().toISOString());
    if (start_date == null || start_date == "") {
        alert("No valid data")
        send()
        return
    }
    let end_date = prompt("end_date=", new Date().toISOString());
    if (end_date == null || end_date == "") {
        alert("No valid data")
        send()
        return
    }
    let place = prompt("place=", "place");
    if (place == null || place == "") {
        alert("No valid data")
        send()
        return
    }
    fetch(window.config.address + "/events/" + masterPassword, {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            description: description,
            start_date: start_date,
            end_date: end_date,
            place: place
        })            
    }).then( async (response) => {
        if (response.status != 200) {
            alert("Invalid credentials!")
            console.log(await response.json())
            send()
            return
        }
        document.getElementById("output").innerHTML = `<div class="alert alert-success" role="alert">Sent!</div>`
        if (confirm("Reload data?")) {
            send()
        }
    })
}

function deleteEvent(id) {
    let masterPassword = prompt("Enter master password!", "masterpassword");
    if (masterPassword == null || masterPassword == "") {
        alert("No valid data")
        send()
        return
    }
    fetch(window.config.address + "/events/" + masterPassword + "/" + id, {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then( async (response) => {
        if (response.status != 200) {
            alert("Invalid credentials!")
            console.log(await response.json())
            send()
            return
        } else {
            document.getElementById("output").innerHTML = `<div class="alert alert-success" role="alert">Sent!</div>`
        }
        if (confirm("Reload data?")) {
            send()
        }
    })
}