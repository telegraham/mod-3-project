
ELEMENTS = {
  cache: {},
  cacheKey: function(fnName, param){
    return fnName + "__" + param;
  },
  get: function(fnName, param){
    const cacheKey = this.cacheKey(fnName, param);
    let cached = this.cache[cacheKey];
    if (!cached) {
      cached = document[fnName](param);
      this.cache[cacheKey] = cached;
    }
    return cached;
  },
  init: function(){
    ["querySelector"].forEach(fnName => this[fnName] = (param) => this.get(fnName, param));
  }
}

ELEMENTS.init()

const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// function hideWelcome(){
//   ELEMENTS.querySelector(".js-welcome").style.display = "none";
// }

// function showAuth(title){
//   ELEMENTS.querySelector(".js-auth").style.display = "block";
//   ELEMENTS.querySelector(".auth__title").innerText = title;
// }


function auth(title){
  // hideWelcome();
  // showAuth(title);
  ELEMENTS.querySelector(".auth__title").innerText = title;
  growAndFadeWelcome()
    .then(flipGrowFadeForm)
}

function growAndFadeWelcome(){
  const welcome = ELEMENTS.querySelector(".js-welcome")
  const auth = ELEMENTS.querySelector(".js-auth")

  const welcomeHeight = welcome.clientHeight

  auth.style.display = "block"
  const authHeight = auth.clientHeight
  auth.style.display = "none"

  const deltaH = authHeight - welcomeHeight;

  welcome.classList.add("js-contentHidden")

  //for later
  const authFactor = 1 - deltaH / authHeight;
  auth.style.transform = `scale(1, ${ authFactor })`
  auth.classList.add("js-contentHidden") 

  return new Promise(function(resolve){
    welcome.addEventListener("transitionend", ({ target }) => {
      if (target.classList.contains("js-main__content")) resolve({ welcome, auth })
    });
  })
}

function flipGrowFadeForm({ welcome, auth }) {
  // console.log(welcome, auth)
  auth.style.display = "block";
  welcome.style.display = "none";
  // auth.style.transform = "";

  setTimeout(() => {
    auth.style.transform = "";
    auth.classList.remove("js-contentHidden")
  }, 1)
}

let lastMove = {}

function move({ clientX, clientY }){
  lastMove = { x: clientX, y: clientY };
}


function over({ target, clientX, clientY }){
  const deltaX = clientX - lastMove.x;
  const deltaY = clientY - lastMove.y;
  let m = deltaY === 0 && deltaX === 0 ? 1 : deltaY / deltaX;
  const d = deltaX > 0 ? 100 : -100;
  const lastX = target.dataset.x || 0
  const lastY = target.dataset.y || 0
  if (m === Infinity) {
    moveButton(target, 0, -d)
  } else if (m === -Infinity) {
    moveButton(target, 0, d)
  } else {
    // console.log(d, m)  
    const newX = d * Math.cos(Math.atan(m));
    const newY = d * Math.sin(Math.atan(m));
    moveButton(target, newX, newY)
  }
} 

function moveButton(element, dX, dY) {
  // console.log(element)
  // console.log(dX, dY)
  const lastX = element.dataset.x ? parseInt(element.dataset.x) : 0;
  const lastY = element.dataset.y ? parseInt(element.dataset.y) : 0;


  // console.log(lastDX, lastDY)

  

  let x = lastX + dX;
  let y = lastY + dY;

  const offsetX = element.offsetLeft + x;
  const offsetY = element.offsetTop + y;

  if (offsetX <= 0 
        || offsetY <= 0 
        || offsetX >= window.innerWidth - element.clientWidth 
        || offsetY >= window.innerHeight - element.clientHeight) {
    x = lastX - dX * 2;
    y = lastY - dY * 2;
  }

  // console.log(dX, dY)
  element.dataset.x = x;
  element.dataset.y = y;

  element.style.transform = `translate(${ x }px, ${ y }px)`;
}

const throttledOver = throttle(over, 100, true);

function stoppedPropagation(event) { 
  event.stopPropagation(); 
  event.preventDefault();
  throttledOver(event);
}

document.addEventListener("DOMContentLoaded", function(){
  ELEMENTS.querySelector(".js-welcome").addEventListener("click", function(event){
    if (event.target.classList.contains("js-register")) {
      event.preventDefault()
      auth("Sign Up")
    }
    else if (event.target.classList.contains("js-login")) {
      event.preventDefault()
      auth("Log In")
    }
  })

  document.addEventListener("mousemove", move)
  const mover = ELEMENTS.querySelector(".js-mover")
  
  mover.addEventListener("mousedown", stoppedPropagation)
  mover.addEventListener("mousemove", stoppedPropagation)
  mover.addEventListener("mouseover", throttledOver)

  ELEMENTS.querySelector(".js-auth").addEventListener("submit", function(event){
    event.preventDefault()
    moveButton(mover, Math.random() * 200 - 100, Math.random() * 200 - 100)
  })
})
