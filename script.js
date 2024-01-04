let newButton = document.getElementById("newSlide")
let compile = document.getElementById("export")
let footer = document.getElementById("thumbnail")

let current = 1
let ccount = 1
let frames = []
let frameData = []
let saved = []
let elements = []
let undo = []
let redo = []

function init() {
  newSlide(true)

  newCanvas(true)
  
}

function newCanvas(active = false) {
  let canvas = document.createElement("canvas")

  canvas.active = true
  canvas.ID = ccount - 1
  canvas.className = "canvas"
  canvas.style.transform = "scale(" + scale + ", " + scale + ") translate(" + transX + "px, " + transY + "px)"

  let ctx = canvas.getContext("2d")
  ctx.fillStyle = "white"
  ctx.fillRect(0,0,canvas.width, canvas.height)
  ctx.lineWidth = size
  ctx.lineCap = "round"        

  frames.push(canvas)
  frameData.push(ctx)
  undo.push([])
  document.getElementById("target").appendChild(canvas)

  if (active) {
    canvas.style.display = "block"
  }
}

function newSlide(active = false) {
  
  let div = document.createElement("div")
  div.className = "newFrame"
  div.ID = ccount
  elements.push(div)

  let holder = document.createElement("div")
  holder.className = "thumbnailHolder"

  div.holder = holder

  let buttonHolder = document.createElement("div")
  buttonHolder.className = "buttonHolder"

  buttonHolder.addEventListener("mouseleave", function() {
    buttonHolder.style.display = "none"
  })

  let icon

  let leftB = document.createElement("button")
  icon = document.createElement("i")
  icon.className = "fas fa-arrow-left"
  leftB.appendChild(icon)
  leftB.title = "Move Left"
  buttonHolder.appendChild(leftB)
  
  let copyB = document.createElement("button")
  icon = document.createElement("i")
  icon.className = "fas fa-copy"
  copyB.appendChild(icon)
  copyB.title = "Copy"
  buttonHolder.appendChild(copyB)

  let pasteB = document.createElement("button")
  icon = document.createElement("i")
  icon.className = "fas fa-paste"
  pasteB.appendChild(icon)
  pasteB.title = "Paste"
  buttonHolder.appendChild(pasteB)

  let deleteB = document.createElement("button")
  icon = document.createElement("i")
  icon.className = "fas fa-trash"
  deleteB.appendChild(icon)
  deleteB.title = "Delete"
  buttonHolder.appendChild(deleteB)

  deleteB.addEventListener("click", function() {
    deleteFrame(div)
  })

  let rightB = document.createElement("button")
  icon = document.createElement("i")
  icon.className = "fas fa-arrow-right"
  rightB.appendChild(icon)
  rightB.title = "Move Right"
  buttonHolder.appendChild(rightB)

  holder.appendChild(buttonHolder)
  div.appendChild(holder)

  footer.appendChild(div)

  

  div.addEventListener("click", function() {
    if (!Delete) {
      activate(div.ID)

      let img = document.createElement("img")
      let data = frames[(current - 1)].toDataURL("img/png")
      img.src = data
      saved[(current - 1)] = img
  
      let newCurrent = current - 1
  
      img.addEventListener("mouseenter", function() {
        document.getElementsByClassName("buttonHolder")[newCurrent].style.display = "flex"
      })
  
      updateThumbnail(div)
      updateCanvas(div.ID)
  
      
  
      current = div.ID
      console.log(current)
      console.log(Delete)
    } else {
      Delete = false
    }
    
  })

  div.addEventListener("mouseenter", function() {
    buttonHolder.style.display = "flex"
  })

  if (active) {
    div.style.borderColor = "blue"
  }

  ccount++
  
}

function activate(id) {
  if (!Delete) {
    let slides = document.getElementsByClassName("newFrame")
    for(let i = 0; i < slides.length; i++) {
      slides[i].style.borderColor = "black"
    }
  
    console.log(id)
    console.log(slides[(id - 1)])
    console.log(slides)
    slides[(id - 1)].style.borderColor = "blue"
  }
  
}

function updateCanvas(id) {
  if (!Delete) {
    for(let i = 0; i < frames.length; i++) {
    frames[i].style.display = "none"
    }
  
    frames[(id - 1)].style.display = "block"
  } 
  
}

function updateThumbnail(element) {
  let slides = document.getElementsByClassName("newFrame")

  if (slides[(current - 1)].holder.children.length - 1) {
    slides[(current - 1)].holder.removeChild(slides[(current - 1)].holder.children[1])
  }

  saved[(current - 1)].className = "thumbnail"
  slides[(current - 1)].holder.appendChild(saved[(current - 1)])
}

newButton.addEventListener("click", function() {
  newSlide()
  newCanvas()

  console.log(frames)
  console.log(frameData)
})

let draw = false
let prevX = null
let prevY = null
let timer

let action = []

function redraw() {
  let holdStyle = frameData[(current - 1)].strokeStyle 
  let holdWidth = size
  frameData[(current - 1)].fillStyle = "white"
  frameData[(current - 1)].fillRect(0,0, frames[(current - 1)].width, frames[(current - 1)].height)
  console.log(undo)
  for (let i = 0; i < undo[(current - 1)].length; i++) {
    for (let j = 0; j < undo[(current - 1)][i].length; j++) {
      let data = undo[(current - 1)][i][j] 
      switch(data.type) {
        case "BRUSH":
          frameData[(current - 1)].strokeStyle = data.color
          frameData[(current - 1)].lineWidth = data.size
          frameData[(current - 1)].beginPath()
          frameData[(current - 1)].moveTo(data.prevX, data.prevY)
          frameData[(current - 1)].lineTo(data.currentX, data.currentY)
          frameData[(current - 1)].stroke()
          break
        case "LINE":
          frameData[(current - 1)].strokeStyle = data.color
          frameData[(current - 1)].lineWidth = data.size
          frameData[(current - 1)].beginPath()
          frameData[(current - 1)].moveTo(data.prevRecordX, data.prevRecordY)
          frameData[(current - 1)].lineTo(data.recordX, data.recordY)
          frameData[(current - 1)].stroke()
          break
      }
    }
  }
  frameData[(current - 1)].strokeStyle = holdStyle
  frameData[(current - 1)].lineWidth = holdWidth
}

window.addEventListener("keydown", function(event) {
  if (event.ctrlKey && event.key == "z" || event.key == "Z" && !draw) {
    console.log(current)
    if (undo[(current - 1)].length) {
      redo.push(undo[(current - 1)].pop())
      redraw()
    }
  }
  
  if (event.ctrlKey && event.key == "y" && !draw) {
    if (redo.length) {
      undo[(current - 1)].push(redo.pop())
      redraw()
    }
  }
  
})

document.getElementById("uploadTrans").addEventListener("change", function(event) {
  url = URL.createObjectURL(event.target.files[0])

  if (document.getElementsByClassName("transparent").length) {
    document.getElementsByClassName("transparent")[0].remove()
  }
  
  let img = document.createElement("img")
  
  img.src = url
  img.draggable = false
  img.className = "transparent"

  document.getElementById("target").appendChild(img)

  img.style.transform = "scale(" + scale + ", " + scale + ") translate(" + transX + "px, " + transY + "px)"

  document.getElementById("uploadTrans").value = ""
  console.log(event.target.files)
})

document.getElementById("transparent").addEventListener("click", function() {
   addTransparent()
})

function addTransparent() {
  if (frames.length - 1) {
    if (document.getElementsByClassName("transparent").length) {
      document.getElementsByClassName("transparent")[0].remove()
    } else {
      console.log("this works?")
      let img = document.createElement("img")
      
      img.src = frames[(current - 2)].toDataURL("img/png")
      img.draggable = false
      img.className = "transparent"
  
      document.getElementById("target").appendChild(img)

      img.style.transform = "scale(" + scale + ", " + scale + ") translate(" + transX + "px, " + transY + "px)"
    }
    
  }
}

document.getElementById("copy").addEventListener("click", function() {
  if (frames.length - 1) {
    undo[(current - 1)] = [...undo[(current - 2)]]
    redraw()
  }
})

let recordX = null
let recordY = null

let prevRecordX = null
let prevRecordY = null

let movement = false

window.addEventListener("mousedown", function(event) {
  draw = true
  clearTimeout(timer)

  action = []
  redo = []


  let offset = frames[(current - 1)].getBoundingClientRect()
  
  recordX = (event.clientX - offset.left) / scale
  recordY = (event.clientY - offset.top) / scale 

  if (event.shiftKey && !movement && prevRecordX != null) {
    frameData[(current - 1)].beginPath()
    frameData[(current - 1)].moveTo(prevRecordX, prevRecordY)
    frameData[(current - 1)].lineTo(recordX, recordY)
    frameData[(current - 1)].stroke()

    action.push({type: "LINE", prevRecordX: prevRecordX, prevRecordY: prevRecordY  , recordX: recordX, recordY: recordY, color: frameData[(current - 1)].strokeStyle, size:size})

    undo[(current - 1)].push(action)
    action = []
  }

  prevRecordX = recordX
  prevRecordY = recordY 
})



window.addEventListener("mouseup", function() {
  draw = false
  movement = false

  prevX = null
  prevY = null

  if (action.length) {
    undo[(current - 1)].push(action)
  }
  

  console.log(undo)
  
  timer = setTimeout(function() {
    let img = document.createElement("img")
    let data = frames[(current - 1)].toDataURL("img/png")
    img.src = data
    saved[(current - 1)] = img

    let newCurrent = current - 1

    img.addEventListener("mouseenter", function() {
      document.getElementsByClassName("buttonHolder")[newCurrent].style.display = "flex"
    })

    updateThumbnail(elements[(current - 1)])
  }, 3000)
})

window.addEventListener("mousemove", function(event) {

  if (event.buttons == "1") {

    movement = true
    
    let offset = frames[(current - 1)].getBoundingClientRect()
    
    if (prevX == null || prevY == null || !draw) {
      prevX = (event.clientX - offset.left) / scale
      prevY = (event.clientY - offset.top) / scale

      return
    }
  
    
  
    let currentX = (event.clientX - offset.left) / scale
    let currentY = (event.clientY - offset.top) / scale

  
    frameData[(current - 1)].beginPath()
    frameData[(current - 1)].moveTo(prevX, prevY)
    frameData[(current - 1)].lineTo(currentX, currentY)
    frameData[(current - 1)].stroke()
  
    action.push({type: "BRUSH", prevX: prevX, prevY: prevY, currentX: currentX, currentY: currentY, color: frameData[(current - 1)].strokeStyle, size:size})
    
  
    prevX = currentX
    prevY = currentY

    
  }
})

document.getElementById("brushColor").addEventListener("input", function(event) {
  for (let i = 0; i < frameData.length; i++) {
    frameData[i].strokeStyle = event.target.value
  }
  document.getElementById("brushColorHolder").children[0].style.color = event.target.value
})

compile.addEventListener("click", function() {
  const encoder = new GIFEncoder(300, 200);
  encoder.setRepeat(0)
  encoder.setDelay(500);
  encoder.start()

  for (let i = 0; i < frameData.length; i++) {
    encoder.addFrame(frameData[i])
  }

  encoder.finish()
  let stream = encoder.stream().getData()
  let url = 'data:image/gif;base64,'+ encode64(stream);

  console.log(url)
  console.log(encoder)

  encoder.download("test.gif")
  
})



let scale = 1

window.addEventListener("mousewheel", function(event) {
  scale -= (event.deltaY / 1000)

  if (scale <= 0) {
    scale = 0.1
  }

  if (document.getElementsByClassName("transparent").length) {
    document.getElementsByClassName("transparent")[0].style.transform = "scale(" + scale + ", " + scale + ") translate(" + transX + "px, " + transY + "px)"
  }
  
  for (let i = 0; i < frames.length; i++) {
    frames[i].style.transform = "scale(" + scale + ", " + scale + ") translate(" + transX + "px, " + transY + "px)"
  }
})

let transX = 0
let transY = 0

window.addEventListener("mousemove", function(event) {
  if (event.buttons == "2") {
    transX += event.movementX / 3
    transY += event.movementY / 3

    if (document.getElementsByClassName("transparent").length) {
      document.getElementsByClassName("transparent")[0].style.transform = "scale(" + scale + ", " + scale + ") translate(" + transX + "px, " + transY + "px)"
    }

    for (let i = 0; i < frames.length; i++) {
      frames[i].style.transform = "scale(" + scale + ", " + scale + ") translate(" + transX + "px, " + transY + "px)"
    }
  }
})

window.addEventListener("contextmenu", function(event) {
  event.preventDefault()
})

let sizeMenu = false
let size = 3 

document.getElementById("size").addEventListener("click", function() {
  if (!sizeMenu) {
    document.getElementById("slideHolder").style.display = "flex"
    sizeMenu = true
  } else {
    document.getElementById("slideHolder").style.display = "none"
    sizeMenu = false
  }
})

document.getElementById("back").addEventListener("click", function() {
  document.getElementById("previewHolder").style.display = "none"
})

document.getElementById("view").addEventListener("click", function() {
  document.getElementById("previewHolder").style.display = "flex"

  const encoder = new GIFEncoder(300, 200);
  encoder.setRepeat(0)
  encoder.setDelay(500);
  encoder.start()

  for (let i = 0; i < frameData.length; i++) {
    encoder.addFrame(frameData[i])
  }

  encoder.finish()
  let stream = encoder.stream().getData()
  let url = 'data:image/gif;base64,'+ encode64(stream);

  let img = document.createElement("img")

  img.src = url

  document.getElementById("window").appendChild(img)

  console.log(url)
})

document.getElementById("save").addEventListener("click", function() {
  download("save.json", JSON.stringify(undo))
})

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

document.getElementById("load").addEventListener("change", function(event) {

  let url = URL.createObjectURL(event.target.files[0])

  let xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';
  xhr.onload = function(e) {
    if (this.status == 200) {
      reader.readAsText(this.response);
      // console.log(this.responseText)
    }
  };
  xhr.send();
})

const reader = new FileReader();
reader.addEventListener('loadend', () => {
  let data = JSON.parse(reader.result)
  console.log(data)

  document.getElementById("previewHolder").style.display = "none"

  for (let i = 0; i < data.length-1; i++) {
    newSlide()
    newCanvas()
  }

  undo = [...data]
  let hold = current
  for (let i = 1; i < data.length + 1; i++) {
    current = i
    redraw()
  }

  current = hold
  console.log(current)
  console.log(undo)
  
});

document.getElementById("slide").addEventListener("input", function(event) {
  size = event.target.value
  document.getElementById("slideOut").innerHTML = size + "px"

  for (let i = 0; i < frameData.length; i++) {
    frameData[i].lineWidth =  size
  }
})

let Delete = false 

function deleteFrame(element) {
  if (frames.length - 1) {

    
    
    let id = element.ID - 1

    frameData.splice(id, 1)
    frames[id].remove()
    frames.splice(id, 1)
    undo.splice(id, 1)
    saved.splice(id, 1) 
    element.remove()
    elements.splice(id, 1)

    console.log(frameData)
    console.log(frames)
    console.log(undo)
    console.log(saved)
    console.log(elements)

    ccount--
    

    for (let i = 0; i < elements.length; i++) {
      elements[i].ID = i + 1
    }
    
    activate(id)
    updateCanvas(id)

    clearTimeout(timer)

    Delete = true

    current = 1
    console.log(current)

  }
}

init()