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
    fetch(window.config.address + "/getCodes/" + masterPassword, {
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
        var table = document.getElementById("codelist")
        table.innerHTML = ""
        var numOfUsed = 0
        for (var i = 0; i < jsonData.length; i++) {
            console.log(jsonData[i])
            var usage = ""
            if (jsonData[i].hasBeenUsed == false) {
                usage = '<i class="fa-solid fa-check" style="color: #00ff04;"></i>'
            } else {
                usage = '<i class="fa-solid fa-xmark" style="color: #ff0022;"></i>'
                numOfUsed += 1
            }
            table.innerHTML += `<tr><td>${jsonData[i].passkey}</td><td>${usage}</td><td>${jsonData[i].createdAt}</td></tr>`
        }
        document.getElementById("output").innerHTML = `<div class="alert alert-warning" role="alert">${numOfUsed} of ${jsonData.length} codes have been used.</div>`
    })
}

function resetCodes() {
    let masterPassword = prompt("Enter master password!", "masterpassword");
    if (masterPassword == null || masterPassword == "") {
      alert("No valid data")
      send()
      return
    }
    let n = prompt("n=", "10");
    if (n == null || n == "") {
      alert("No valid data")
      send()
      return
    }
    fetch(window.config.address + "/resetCodes/" + masterPassword + "/" + n, {
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
        document.getElementById("output").innerHTML = `<div class="alert alert-success" role="alert">Code reset complete!</div>`
        if (confirm("Reload codes?")) {
            send()
        }
    })
}
