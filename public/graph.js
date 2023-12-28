async function loadConfig() {
    const response = await fetch("config.json");
    const jsonData = await response.json();
    window.config = jsonData
    init()
}

function init() {
    var masterPassword = prompt("Enter master password!", "masterpassword");
    if (masterPassword == null || masterPassword == "") {
        alert("No valid data")
        init()
        return
    }
    fetch(window.config.address + "/graphdata/" + masterPassword, {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    }).then( async (response) => {
        if (response.status != 200) {
            alert("Invalid credentials!")
            console.log(await response.json())
            init()
            return
        }
        jsonData = await response.json()
        console.log(jsonData)
        var edges = []
        var nodes = jsonData.map((item) => {
            return item.fromc
        })
        nodes = nodes.concat(jsonData.map((item) => {
            return item.toc
        }))
        var uniqueNodes = [...new Set(nodes)]
        for (var i = 0; i < uniqueNodes.length; i++) {
            uniqueNodes[i] = { data: { id: uniqueNodes[i] } }
        }
        for (var i = 0; i < jsonData.length; i++) {
            edges.push({ data: { id: 'e' + i, source: jsonData[i].fromc, target: jsonData[i].toc } })
        }
        console.log(edges)
        var cy = cytoscape({
            container: document.getElementById('cy'),
            style: [
                {
                    selector: 'node',
                    css: {
                        width: 50,
                        height: 50,
                        'background-color':'#61bffc',
                        content: 'data(id)'
                    }
                    
                }
            ],
            elements: {
        
                    
                nodes: uniqueNodes,
              edges: edges
            },
            layout: {
                name: 'breadthfirst',
                directed: true,
                padding: 10,
               /* color: "#ffff00",*/
                fit: true
            }
        });
    })
}