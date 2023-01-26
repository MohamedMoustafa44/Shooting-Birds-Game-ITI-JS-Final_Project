window.addEventListener("load", function () {
    let time = 59;
    let score = 0;
    let killedBirds = 0;
    let endMSG = "";
    let endIMG = document.querySelector("#endImg");
    let userName = new URLSearchParams(window.location.search);
    let user = document.querySelector("#name");
    user.innerText = userName.get("userName");
    let lastScore = document.querySelector("#lastScore");
    let date = new Date();
    let today = document.querySelector("#date");
    today.innerText = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    let users = [];
    let newUser = true;
    let currentUser;
    if (localStorage.length != 0) {
        users.push(...JSON.parse(localStorage.getItem("users")));
        console.log(users);
        for (let i = 0; i < users.length && newUser; i++) {
            if (users[i].name == userName.get("userName")) {
                console.log(users[i]);
                newUser = false;
                lastScore.innerText = users[i].lastScore;
                currentUser = i;
            }
        }
    }
    let birdObjs = [
        {
            src: "images/1.gif",
            add: 10,
            width: "50px",
        },
        {
            src: "images/2.gif",
            add: 5,
            width: "100px",
        },
        {
            src: "images/3.gif",
            add: -10,
            width: "300px",
        }
    ];
    let bombObjs = [
        {
            src: "images/bomb.png",
            range: "surrBirds",
            width: "100px",
        },
        {
            src: "images/tnt.png",
            range: "allBirds",
            width: "100px",
        }
    ];

    class Element {
        constructor(elementFeatures, classList) {
            this.htmlElement = document.createElement("img");
            this.htmlElement.classList.add(...classList);
            this.htmlElement.src = elementFeatures.src;
            this.htmlElement.style.width = elementFeatures.width;
            this.htmlElement.style.height = elementFeatures.width;
            document.querySelector("body").appendChild(this.htmlElement);
        }
    }// Element class ended here (Base Class for all elements appear in the game)

    class Bird extends Element {
        constructor(top, birdFeatures) {
            super(birdFeatures, ["bird", birdFeatures.add]);
            this.htmlElement.style.top = top;
            this.htmlElement.style.left = 0 + "px";
        }
    } // Bird class ended here

    class Bomb extends Element {
        constructor(left, bombFeatures) {
            super(bombFeatures, ["bomb", bombFeatures.range])
            this.htmlElement.style.top = 0 + "px";
            this.htmlElement.style.left = left;
        }
    }// Bomb class ended here

    swal({
        title: `Welcome ${userName.get("userName")}`,
        text: "We hope you enjoy our game, to win you have to kill birds until getting the score >= 50 ",
        icon: "success",
        button: "Start game",
    }).then(() => {
        timeCounter(time, "#time");// start decreasing time

        function timeCounter(time, selector) {
            let id = setInterval(() => {
                if (time != 0) {
                    document.querySelector(selector).innerText = `0:${time--}`;
                }
                else {
                    clearInterval(id);
                    document.querySelector(selector).innerText = "0:00";
                }
            }, 1000);
        }

        let createBird = setInterval(() => {
            new Bird(randomRange(400, 50) + "px", birdObjs[randomRange(3, 0)]);// randomRange(max, min) it returns random number between specific range
        }, 1000);// Creating birds interval ended here

        let createBomb = setInterval(() => {
            new Bomb(randomRange(innerWidth, 50) + "px", bombObjs[randomRange(2, 0)]);// randomRange(max, min) it returns random number between specific range
        }, 1000 * 5);// Creating bomb interval ended here

        let elementActions = setInterval(() => {
            document.querySelectorAll(".bird").forEach(bird => {
                moving(bird, "toRight", innerWidth, 5);// this function moves any element inside the game with specific speed and direction
                bird.onclick = function () {
                    score += parseInt(bird.classList[1]);
                    document.querySelector("#score").innerText = score;
                    killedBirds++;
                    document.querySelector("#killedBirds").innerText = killedBirds;
                    bird.src = "images/dead.png";
                    bird.style.pointerEvents = "none";
                    bird.className = "stop";
                    new Promise(() => setTimeout(() => { bird.remove(); }, 1000));
                };
            });// Birds movement and creating event for each bird

            document.querySelectorAll(".bomb").forEach(bomb => {
                moving(bomb, "toBottom", innerHeight, 3);// this function moves any element inside the game with specific speed and direction
                bomb.onclick = function () {
                    document.querySelectorAll(".bird").forEach(bird => {
                        let sameHLine = 40 + parseInt(bird.style.left) + parseInt(bird.style.width) > parseInt(bomb.style.left) && parseInt(bird.style.left) + parseInt(bird.style.width) < parseInt(bomb.style.left) + parseInt(bomb.style.width) + 350;
                        let sameVLine = 40 + parseInt(bird.style.top) + parseInt(bird.style.height) > parseInt(bomb.style.top) && parseInt(bird.style.top) + parseInt(bird.style.height) < parseInt(bomb.style.top) + parseInt(bomb.style.height) + 350;
                        if (this.classList.contains("surrBirds")) {
                            if (sameHLine && sameVLine) {
                                bird.click();
                            }
                        }
                        else {
                            document.querySelectorAll(".bird").forEach(bird => {
                                bird.click();
                            });
                        }
                        bomb.src = "images/exploding.png";
                        bomb.style.pointerEvents = "none";
                        bomb.classList.remove("bomb");
                        bomb.classList.add("stop");
                        new Promise(() => setTimeout(() => { bomb.remove(); }, 1000));
                    });
                };
            });// Bomb movement and creating event for each bomb
        }, 50); // Bird actions interval ended here

        function randomRange(max, min) {
            return Math.floor(Math.random() * (max - min)) + min;
        }

        function moving(element, direction, screenLimit, speed) {
            let condition = (direction === "toBottom" && parseInt(element.style.top) < 0.99 * (screenLimit - parseInt(element.style.height))) || (direction === "toRight" && parseInt(element.style.left) < 0.99 * (screenLimit - parseInt(element.style.width)));
            if (condition) {
                if (direction == "toBottom") {
                    element.style.top = parseInt(element.style.top) + speed + "px";
                }
                else if (direction == "toRight") {
                    element.style.left = parseInt(element.style.left) + speed + "px";
                }
            }
            else {
                element.remove();
            }
        }

        setTimeout(function () {
            if (newUser) {
                users.push({
                    name: userName.get("userName"),
                    lastScore: score,
                });
                console.log(users);
            }
            else {
                users[currentUser].lastScore = score;
            }
            localStorage.setItem("users", JSON.stringify(users));
            if (score >= 50) {
                endMSG = "You Win ^_^";
                endIMG.src = "images/happy.png"
            }
            else {
                endMSG = "You Lose -_-";
                endIMG.src = "images/sad.png"
            }
            clearInterval(createBird);
            clearInterval(elementActions);
            clearInterval(createBomb);
            document.querySelectorAll(".bird , .bomb").forEach(element => {
                element.remove();
            });
            document.querySelector("#modal").style.display = "block";
            document.querySelector("#endMsg").innerText = endMSG;
            document.querySelector("button").onclick = function () {
                location.reload();
            }
        }, 1000 * 10);
    });
});// End of the game