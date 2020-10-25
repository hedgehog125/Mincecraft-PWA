{
    info: {
        id: "Video",
        description: "A simple plugin for displaying videos in Bagel.js"
    },
    plugin: {
        types: {
            assets: {
                videos: {
                    args: {},
                    init: (asset, ready, game, plugin, index) => {
                        let video = document.createElement("video");
                        ((video, ready, asset, plugin) => {
                            video.onloadeddata = event => {
                                video.pause();
                                video.muted = false;
                                video.currentTime = 0;

                                let canvas = document.createElement("canvas");
                                let ctx = canvas.getContext("2d");
                                canvas.width = video.videoWidth;
                                canvas.height = video.videoHeight;
                                ctx.drawImage(video, 0, 0);

                                // set.asset has to be run inside a plugin
                                let current = Bagel.internal.current;
                                let pluginWas = current.plugin;
                                current.plugin = plugin;
                                game.set.asset.img(asset.id, canvas);
                                current.plugin = pluginWas;

                                ready({
                                    internal: {
                                        canvas: canvas,
                                        ctx: ctx,
                                        video: video
                                    },
                                    ...asset
                                });
                            };
                        })(video, ready, asset, plugin);
                        video.src = asset.src;
                        video.load();

                        // Play it for a frame or so. This means the first frame is loaded
                        video.muted = true; // Mute it so it can auto play
                        (video => {
                            video.play().catch(() => {
                                video.pause();
                            });
                        })(video);
                    },
                    get: "video",
                    description: "A video. Creates an image asset with the same id that updates as it plays."
                }
            }
        },
        methods: {
            game: {
                playVideo: {
                    fn: {
                        obArg: false,
                        args: {
                            id: {
                                required: true,
                                types: ["string"],
                                description: "The id of the video to play."
                            },
                            loop: {
                                required: false,
                                default: false,
                                types: ["boolean"],
                                description: "If the video should loop or not."
                            },
                            startTime: {
                                required: false,
                                default: 0,
                                types: ["number"],
                                description: "The starting time for the video in seconds."
                            },
                            muted: {
                                required: false,
                                default: false,
                                types: ["boolean"],
                                description: "If the video is muted or not."
                            }
                        },
                        fn: (game, args, plugin) => {
                            let video = game.get.asset.video(args.id).internal;
                            video.video.loop = args.loop;
                            video.video.currentTime = args.startTime;

                            let internalPlugin = game.internal.plugins.Internal;

                            if (internalPlugin.vars.audio.autoPlay) {
                                try {
                                    video.video.muted = args.muted;
                                }
                                catch {
                                    internalPlugin.vars.audio.autoPlay = false;
                                }
                            }

                            if (internalPlugin.vars.audio.autoPlay) {
                                ((args, internalPlugin, video) => {
                                    video.video.play().catch(() => {
                                        video.video.pause();

                                        internalPlugin.vars.audio.autoPlay = false;

                                        video.video.muted = true;
                                        video.video.play().catch(video => video.pause()); // Play it muted
                                        plugin.vars.queue.push(video); // Queue it to be unmuted

                                        let builtIn = game.internal.plugins.Internal; // Create the unmute button
                                        builtIn.vars.audio.createUnmute(builtIn, game);
                                    });
                                })(args, internalPlugin, video);
                            }
                            else {
                                video.video.muted = true;
                                video.video.play(); // Play it muted
                                plugin.vars.queue.push(video); // Queue it to be unmuted

                                let builtIn = game.internal.plugins.Internal; // Create the unmute button
                                builtIn.vars.audio.createUnmute(builtIn, game);
                            }
                        }
                    }
                },
                stopVideo: {
                    fn: {
                        obArg: false,
                        args: {
                            id: {
                                required: true,
                                types: ["string"],
                                description: "The id of the video to stop."
                            }
                        },
                        fn: (game, args, plugin) => {
                            game.get.asset.video(args.id).internal.video.pause();
                        }
                    }
                }
            }
        },
        scripts: {
            main: (plugin, game) => {
                let autoPlay = game.internal.plugins.Internal.vars.audio.autoPlay;
                if (autoPlay != plugin.vars.prevAutoPlay) {
                    plugin.vars.prevAutoPlay = autoPlay;
                    if (autoPlay) { // Unmute the queued
                        for (let i in plugin.vars.queue) {
                            plugin.vars.queue[i].video.muted = false;
                        }
                        plugin.vars.queue = [];
                    }
                }

                let videos = game.internal.assets.assets.videos;
                for (let i in videos) {
                    let video = videos[i].internal;
                    let canvas = video.canvas;
                    let ctx = video.ctx;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(video.video, 0, 0);
                    game.set.asset.img(videos[i].id, canvas, true);
                }
            }
        }
    },
    vars: {
        prevAutoPlay: true,
        queue: []
    }
};
