if (!document.cookie.includes("password")) {
    initRemote()
}

getLatency()

function getLatency() {
    var start = new Date().getTime();
    var latency = 0;
    var socket = new WebSocket("ws://95.138.193.252:32039/lo");
    socket.onopen = function(e) {
        var end = new Date().getTime();
        latency = end - start;
        if (latency < 100) {
            document.getElementById("output").innerHTML = `<i class="fa-solid fa-check" style="color: #00c217;"></i>`;
        } else if (latency < 200) {
            document.getElementById("output").innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: #d6e600;"></i>`;
        } else {
            document.getElementById("output").innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: #db0000;"></i>`;
        }
        socket.close()
        setTimeout(() => {
          getLatency()
        }, 1000);
    };
    socket.onclose = function(event) {
      if (!event.wasClean) {
        if (window.navigator.userAgent.includes("Mac")) {
            return
        }
        document.getElementById("output").textContent = `Socket closed with error!`;
      }
    };
    socket.onerror = function(error) {
        if (window.navigator.userAgent.includes("Mac")) {
            return
        }
        document.getElementById("output").textContent = `Socket error!`;
    }
  }
  

  async function loadConfig() {
      const response = await fetch("config.json");
      const jsonData = await response.json();
      window.config = jsonData
      //window.socket = new WebSocket("ws://" + window.config.address.split("//")[1]);
      window.socket = new WebSocket("ws://95.138.193.252:32039")
      window.socket.onopen = function(e) {
          document.getElementById("output").textContent = "QnA Receiver is ready!"
      };
      
      
      window.socket.onclose = function(event) {
        if (event.wasClean) {
          document.getElementById("output").textContent = "QnA Receiver is ready!"
        } else {
          document.getElementById("output").textContent = "QnA Receiver error!"
        }
      };
      
      window.socket.onerror = function(error) {
          document.getElementById("output").textContent = "QnA Receiver error!"
      };
  
      window.socket.addEventListener('message', function (event) {
          var jsonData = JSON.parse(event.data)
          console.log(jsonData)

          try {
          if (jsonData.command.length > 0) {
            console.log("Command")
            return
          }
        } catch (error) {
            console.log("Not command")
        }


          var tablerow = document.createElement("tr")
          tablerow.id = jsonData.uuid
            var tabledata = document.createElement("td")
            tabledata.textContent = jsonData.uuid.substring(0, 5) + "..."
            tablerow.appendChild(tabledata)
            var tabledata = document.createElement("td")
            tabledata.textContent = jsonData.sender
            tablerow.appendChild(tabledata)
            var tabledata = document.createElement("td")
            tabledata.textContent = jsonData.country + " " + getFlag(jsonData.country)
            tablerow.appendChild(tabledata)
            var tabledata = document.createElement("td")
            tabledata.textContent = jsonData.message
            tablerow.appendChild(tabledata)
            var tabledata = document.createElement("td")
            tabledata.innerHTML = `<button type="button" class="contrast" onclick="getElementById('${jsonData.uuid}').remove()">Cl. local</button>`
            tablerow.appendChild(tabledata)
            var tabledata = document.createElement("td")
            tabledata.innerHTML = `<button type="button" class="contrast" onclick="sendRemote('delRemote;' + '${jsonData.uuid}');getElementById('${jsonData.uuid}').remove()">Cl. Remote</button>`
            tablerow.appendChild(tabledata)
          document.getElementById("messages").appendChild(tablerow)
      });
  }
  
function initRemote() {
    var password = prompt("Init, enter password:")
    window.password = password
    fetch("http://95.138.193.252:32039" + "/remote/" + password + "/lo" , {
        method: "GET"
    })
    .then(response => response.json())
    .then(data => {
        if (data.message == "Loopback") {
            alert("Init successful!")
            document.cookie = "password=" + password
        } else {
            alert("Init failed!")
        }
    })
}

function sendRemote(commandword) {
    var password = window.password
    fetch("http://95.138.193.252:32039" + "/remote/" + password + "/" + commandword , {
        method: "GET"
    })
    .then(response => response.json())
    .then(data => {
        if (data.message == "Sent") {
            document.getElementById("output").innerHTML = `<i class="fa-solid fa-arrows-rotate" style="color:  #00c217;"></i>`;
        } else {
            document.getElementById("output").innerHTML = `<i class="fa-solid fa-arrows-rotate" style="color: #db0000;"></i>`;
        }
    })
}