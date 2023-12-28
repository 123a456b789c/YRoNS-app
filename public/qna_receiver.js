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
      document.getElementById("output").textContent = `Socket closed with error!`;
    }
  };
  socket.onerror = function(error) {
      document.getElementById("output").textContent = `Socket error!`;
  }
}

getLatency()

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


          if (jsonData.hasOwnProperty("command")) {
            commandWrapper(jsonData.command)
            return
          }


        var card = document.createElement("article")
        card.id = jsonData.uuid

        var cardHeader = document.createElement("h1")
        cardHeader.style = "margin-bottom: 10px;"
        cardHeader.textContent = jsonData.sender + " (" + jsonData.country /* + " " + getFlag(jsonData.country) */ + ")"

        var cardBody = document.createElement("div")
        var content = document.createElement("p")
        content.style = "font-size: 1.5em; margin-top: 10px;"
        content.textContent = jsonData.message
        content.innerHTML += `<br><button style="margin-top: 10px;" type="button" onclick="getElementById('${jsonData.uuid}').remove()">Clear</button>`
        card.appendChild(cardHeader)
        card.appendChild(cardBody)
        cardBody.appendChild(content)
        document.getElementById("messages").appendChild(card)
    });
}


function commandWrapper(command) {
  if (command == "clear") {
    document.getElementById("messages").innerHTML = ""
  }
  if (command == "reload") {
    location.reload()
  }
  if (command == "flash") {
    var r = document.querySelector(':root');
    r.style.setProperty('--background-color', 'white');
    setTimeout(() => {
      r.style.setProperty('--background-color', '#11191f');
    }, 100);
  }
  if (command.includes("delRemote")) {
    var id = command.split(";")[1]
    document.getElementById(id).remove()
  }
}