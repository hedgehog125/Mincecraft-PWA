// TODO: works terribly in safari
// TODO: firefox audio warning
// TODO: pwa

if (typeof caches == "undefined") {
    alert("Error: \"caches\" doesn't exist. The browser could be too old or this might be HTTP.");
}
else {
    document.onreadystatechange = () => {
        if (document.readyState == "complete") {
            let request = indexedDB.open("Video");
            request.onerror = event => {
                console.log(event.errorCode);
            };
            request.onupgradeneeded = event => {
                event.target.result.createObjectStore("Video");
            };
            request.onsuccess = event => {
                let database = event.target.result;
                let transaction = database.transaction(["Video"], "readonly");
                let objectStore = transaction.objectStore("Video");
                let request = objectStore.get("Video");
                request.onsuccess = event => {
                    let video = event.target.result;
                    if (location.href.includes("#clear")) {
                        let transaction = database.transaction(["Video"], "readwrite"); // The transaction has already ended
                        let objectStore = transaction.objectStore("Video");
                        let request = objectStore.delete("Video");
                        transaction.oncomplete = () => { // Saved
                            window.onbeforeunload = null;
                            location.href = location.href.split("#")[0]; // Remove the #clear
                        };
                        transaction.onerror = event => {
                            console.log(event.errorCode);
                        };
                    }
                    if (video) {
                        game = Bagel.init({
                            id: "game",
                            game: {
                                assets: {
                                    videos: [
                                        {
                                            id: "Video",
                                            src: video
                                        }
                                    ],
                                    imgs: [
                                        {
                                            id: "64x",
                                            src: "assets/imgs/64x.png"
                                        }
                                    ]
                                },
                                sprites: [
                                    {
                                        id: "Background",
                                        img: "Face",
                                        scripts: {
                                            init: [
                                                {
                                                    code: null,
                                                    stateToRun: "game"
                                                }
                                            ]
                                        },
                                        width: 800,
                                        height: 450
                                    },
                                    {
                                        id: "Main video",
                                        img: "Video",
                                        vars: {
                                            beats: [
                                                1, 1, 1, 1, 1, 1, 1, 1, 1,
                                                2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
                                                3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
                                                4, 4, 4, 4, 4, 4, 4, 4,
                                                5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
                                                6, 6, 6, 6, 6, 6, 6, 6,
                                                8, 8, 8, 8, 8, 8, 8, 8
                                            ],
                                            cloning: true,
                                            cloningTick: 0,
                                            shake: {
                                                x: 0,
                                                y: 0,
                                                vel: 0,
                                            },
                                            finalShake: false,
                                            shaken: false
                                        },
                                        clones: {
                                            visible: true,
                                            scripts: {
                                                init: [
                                                    me => {
                                                        let id = me.cloneID;
                                                        let width = me.width;
                                                        let height = me.height;
                                                        me.width++; // Enlarge them slightly. Bagel.js rounds coordinates so things don't appear blurry but it can make lines form between sprites
                                                        me.height++;

                                                        me.vars.target = {
                                                            x: ((id % me.parent.vars.rowLength) * width) + (me.width / 2),
                                                            y: (Math.floor(id / me.parent.vars.rowLength) * height) + (me.height / 2)
                                                        };
                                                        me.layer.sendToBack();
                                                        me.layer.bringForwards();
                                                    }
                                                ],
                                                main: [
                                                    me => {
                                                        if (me.vars.moving) {
                                                            let vel = me.vars.vel;
                                                            let distanceX = me.vars.target.x - me.x;
                                                            let distanceY = me.vars.target.y - me.y;

                                                            let speed = 1;
                                                            if (me.cloneID == me.parent.vars.maxClones - 1) {
                                                                speed = 0.5; // More dramatic
                                                            }
                                                            if (distanceX > 0) {
                                                                vel.x += speed;
                                                            }
                                                            else {
                                                                if (distanceX != 0) {
                                                                    vel.x -= speed;
                                                                }
                                                            }
                                                            if (distanceY > 0) {
                                                                vel.y += speed;
                                                            }
                                                            else {
                                                                if (distanceY != 0) {
                                                                    vel.y -= speed;
                                                                }
                                                            }

                                                            me.x += vel.x;
                                                            me.y += vel.y;
                                                            vel.x *= 0.95;
                                                            vel.y *= 0.95;

                                                            if (distanceX > 0 != ((me.vars.target.x - me.x) > 0)) { // Gone past
                                                                me.x = me.vars.target.x;
                                                            }
                                                            if (distanceY > 0 != ((me.vars.target.y - me.y) > 0)) { // Gone past
                                                                me.y = me.vars.target.y;
                                                            }


                                                            if (me.vars.target.x - me.x == 0 && me.vars.target.y - me.y == 0) {
                                                                me.vars.moving = false;
                                                                me.vars.x = me.x;
                                                                me.vars.y = me.y;
                                                                if (me.cloneID == me.parent.vars.maxClones - 1) { // Screenshake
                                                                    me.parent.vars.shake.vel += 25;
                                                                    me.parent.vars.finalShake = true;
                                                                }
                                                                else {
                                                                    me.parent.vars.shake.vel += 5;
                                                                }
                                                            }
                                                        }
                                                        else {
                                                            me.x = me.vars.x + me.parent.vars.shake.x;
                                                            me.y = me.vars.y + me.parent.vars.shake.y;
                                                        }
                                                    }
                                                ]
                                            },
                                            vars: {
                                                vel: {
                                                    x: 0,
                                                    y: 0
                                                },
                                                moving: true
                                            }
                                        },
                                        scripts: {
                                            init: [
                                                {
                                                    code: me => {
                                                        game.playVideo("Video", true);
                                                        me.vars.scale = me.scale;
                                                    },
                                                    stateToRun: "game"
                                                }
                                            ],
                                            main: [
                                                {
                                                    code: me => {
                                                        let video = game.get.asset.video("Video").internal.video;

                                                        let currentTime = Math.floor(video.currentTime * 60);
                                                        if (currentTime < me.vars.beats.length) {
                                                            me.scale = me.vars.scale / me.vars.beats[currentTime];
                                                        }
                                                        else {
                                                            if (me.vars.cloning) {
                                                                me.vars.rowLength = (game.width / me.width);
                                                                me.vars.maxClones = me.vars.rowLength * (game.height / me.height);

                                                                me.vars.cloningTick++;
                                                                if (me.vars.cloningTick == 15) {
                                                                    me.clone();
                                                                    me.vars.cloningTick = 0;

                                                                    if (me.cloneCount >= 28) {
                                                                        me.visible = false;
                                                                    }
                                                                    if (me.cloneCount == me.vars.maxClones) {
                                                                        me.vars.cloning = false;
                                                                    }
                                                                }
                                                            }
                                                            let shake = me.vars.shake;
                                                            if (shake.vel) {
                                                                shake.x = ((Math.random() * 2) - 1) * shake.vel;
                                                                shake.y = ((Math.random() * 2) - 1) * shake.vel;
                                                                if (me.vars.finalShake) {
                                                                    shake.vel *= 0.9;
                                                                }
                                                                else {
                                                                    shake.vel *= 0.7;
                                                                }

                                                                if (shake.vel < 0.01) {
                                                                    shake.vel = 0;
                                                                    if (me.vars.finalShake) {
                                                                        me.vars.shaken = true;
                                                                    }
                                                                }
                                                            }
                                                            else {
                                                                if (me.vars.shaken) {
                                                                    if (Math.random() < 0.01) {
                                                                        game.get.sprite("Images").clone();
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    },
                                                    stateToRun: "game"
                                                }
                                            ]
                                        },
                                        width: 800,
                                        height: 450
                                    },
                                    {
                                        id: "Images",
                                        clones: {
                                            vars: {
                                                imgs: ["64x", "Face", "Video"]
                                            },
                                            visible: true,
                                            scripts: {
                                                init: [
                                                    me => {
                                                        me.img = me.vars.imgs[Math.round(Math.random() * me.vars.imgs.length)];
                                                        if (me.img == "64x") {
                                                            me.scale = (Math.random() * 1.5) + 0.5;
                                                        }
                                                        else {
                                                            me.scale = (Math.random() * 0.2) + 0.05;
                                                        }

                                                        if (Math.random() > 0.5) {
                                                            me.x = game.width + (me.width / 2);
                                                            me.vars.direction = -1;
                                                        }
                                                        else {
                                                            me.x = -(me.width / 2);
                                                            me.vars.direction = 1;
                                                        }
                                                        me.y = (Math.random() * (game.height - me.height)) + (me.height / 2);
                                                        me.vars.speed = (Math.random() + 0.5) * 2;
                                                    }
                                                ],
                                                main: [
                                                    me => {
                                                        me.x += me.vars.direction * me.vars.speed;
                                                        if (me.vars.direction == 1) {
                                                            if (me.x <= -(me.width / 2)) {
                                                                me.delete();
                                                            }
                                                        }
                                                        else {
                                                            if (me.x >= game.width + (me.width / 2)) {
                                                                me.delete();
                                                            }
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                ],
                                plugins: [
                                    {
                                        src: "assets/scripts/video.js"
                                    }
                                ],
                                scripts: {
                                    init: [
                                        {
                                            code: game => {
                                                setInterval(() => {
                                                    game.paused = game.get.asset.video("Video").internal.video.paused; // Don't mess up the animation when it's paused
                                                }, 15);
                                            },
                                            stateToRun: "game"
                                        }
                                    ],
                                    preload: {
                                        tasks: [
                                            (game, ready) => {
                                                let video = game.get.asset.video("Video").internal.video;
                                                ((game, ready, video) => {
                                                    video.ontimeupdate = () => {
                                                        video.ontimeupdate = null;
                                                        let canvas = document.createElement("canvas");
                                                        let ctx = canvas.getContext("2d");
                                                        canvas.width = game.width;
                                                        canvas.height = game.height;

                                                        let width = game.width * 5;
                                                        let height = game.height * 1.5;
                                                        let x = 300;
                                                        let y = 300;

                                                        ctx.drawImage(video, x - (width / 2), y - (height / 2), width, height);
                                                        game.set.asset.img("Face", canvas);
                                                        game.stopVideo("Video");
                                                        ready();
                                                    };
                                                })(game, ready, video);
                                                game.playVideo("Video", false, 4.4, true);
                                            }
                                        ]
                                    }
                                }
                            },
                            config: {
                                loading: {
                                    mode: "preload",
                                    skip: false
                                }
                            },
                            state: "game",
                            width: 800,
                            height: 450
                        });
                        Bagel.pwa.init({
                            manifest: "manifest.json",
                            worker: "worker.js",
                            versions: "versions.json",
                            version: "version.txt",

                            icons: true,
                            multiTabStorageName: "Mincecraft multitab",
                            versionStorageName: "Mincecraft version",
                            cacheStorageName: "Mincecraft cache"
                        });
                    }
                    else {
                        document.getElementById("uploadMessage").hidden = false;
                        Bagel.init({id:"game",width:1,height:1,config:{display:{dom:false}},state:"game"}); // Create a temporary game so the plugin is loaded
                        Bagel.upload(url => {
                            window.onbeforeunload = e => {
                                e.preventDefault();
                                e.returnValue = "";
                            };

                            let mime = url.split(",")[0].split(":")[1].split(";")[0];
                            if (mime == "video/mp4") {
                                let transaction = database.transaction(["Video"], "readwrite"); // The transaction has already ended
                                let objectStore = transaction.objectStore("Video");
                                let request = objectStore.put(url, "Video");
                                transaction.oncomplete = () => { // Saved
                                    window.onbeforeunload = null;
                                    location.reload();
                                };
                                transaction.onerror = event => {
                                    console.log(event.errorCode);
                                };
                            }
                            else {
                                alert("Unsupported format, mp4s are only supported.");
                                window.onbeforeunload = null;
                                location.reload();
                            }
                        });
                    }
                };
            };
        }
    };
}
