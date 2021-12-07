const SEQ_SIZE = 20


$(function() {

    $('.overlay').css('opacity', '1').hide();

    ////////////////////////////////////////////////////////////
    /////////////////////////  GENERAL  ////////////////////////
    ////////////////////////////////////////////////////////////

    var editionMode = false;
    var expandedMode = true;
    var fadeTime = 200;

    $('.dispoToggle').click(function() {
        if (expandedMode == true) {
            $('.dispoToggle').removeClass('fa-chevron-circle-down').addClass('fa-chevron-circle-up');
            $('.dispoMore').slideDown(fadeTime, function() {
                expandedMode = false;
            });
        }
        if (expandedMode == false) {
            $('.dispoToggle').removeClass('fa-chevron-circle-up').addClass('fa-chevron-circle-down');
            $('.dispoMore').slideUp(fadeTime, function() {
                expandedMode = true;
            });
        }

    });


    $('.editToggle').click(function() {
        if (editionMode == true) {
            saveAll()

            $('.editToggle').removeClass('btnOn').addClass('btnOff');
            $('body').removeClass('editionMode').addClass('playMode');
            $('.textbtn').removeClass('btn');
            $('.seqControls, #addRemoveDispos').fadeOut(fadeTime, function() {
                editionMode = false;
            });
        }
        if (editionMode == false) {
            $('.editToggle').removeClass('btnOff').addClass('btnOn');
            $('body').removeClass('playMode').addClass('editionMode');
            $('.textbtn').addClass('btn');
            $('.seqControls, #addRemoveDispos').fadeIn(fadeTime, function() {
                editionMode = true;
            });
        }
    });


    ///////// Overlay Closer
    $(".overlay").click(function(e) {

        if (e.target !== this) { return; } else { $(this).fadeOut(fadeTime); }

    });


    ///////// Add dispo
    $('.addDispo').click(function() {
        pool.addDispo();
    });
    ///////// Add dispo
    $('.removeDispo').click(function() {
        $('#confirmOverlay').fadeIn(fadeTime);
        $('.validateDelete').unbind().click(function() {
            $('#confirmOverlay').fadeOut(fadeTime);
            pool.removeDispo();
        });
        $('.cancelDelete').unbind().click(function() {
            $('#confirmOverlay').fadeOut(fadeTime);
        });

    });

    // STOP ALL
    $('.stopAll').click(function() {
        emitEvent({ 'event': 'stop' })

        // No box just played
        $.each(pool.allDispos, function(index, dispo) {
            $.each(dispo.allBoxes, function(index, box) {
                // box.justPlayed = false;
                // box.setStateIcon('none')
                // $(box.box).removeClass('justPlayed');
                // $(box.validPlayDiv).removeClass('validPlay-true');
            });
        });
    });


    // PREV NEXT SCENE
    $('.quickScene').click(function() {

        var indexOfActiveScene, indexToGo = 0;
        $.each(project.allScenes, function(index, scene) { if (scene.isActive) indexOfActiveScene = index; });

        if (($(this).hasClass('prevScene')) && (indexOfActiveScene > 0)) {
            indexToGo = indexOfActiveScene - 1;
            console.log('prev');
            project.allScenes[indexToGo].loadScene();
        }
        if (($(this).hasClass('nextScene')) && (indexOfActiveScene < project.allScenes.length - 1)) {
            indexToGo = indexOfActiveScene + 1;
            console.log('next');
            project.allScenes[indexToGo].loadScene();
        } else return;


    });



    ////////////////////////////////////////////////////////////
    /////////////////////////    POOL   ////////////////////////
    ////////////////////////////////////////////////////////////

    pool = new poolObject();
    poolExport = [];
    poolImport = [];

    function poolObject() {

        var that = this;
        that.allDispos = new Array();

        // ADD
        this.addDispo = function() {
            // Index of future dispo
            var xIndex = that.allDispos.length;

            // Expand allMedias Array
            console.log("adding medias with index X: " + xIndex);
            $.each(project.allScenes, function(index, scene) {
                for (var indexY = 0; indexY < SEQ_SIZE; indexY++) {
                    scene.allMedias.push(new media(xIndex, indexY, '...', '...', 'none', 'none'));
                }
            });

            // Push new dispo
            var dispo = new dispoObject('dispo', 'operator', xIndex)
            this.allDispos.push(dispo)

            // reset boxes
            dispo.allBoxes.forEach(box => { box.reset() })
        }

        // REMOVE
        this.removeDispo = function() {
            // remove dispo & dispo div
            that.allDispos.pop();
            $("#dispos").find('th:nth-last-child(2)').remove();
            // Remove boxes
            $('.seqLine').each(function(index, div) {
                $(div).find('.box:last-child').remove();
            });
            // Reduce allMedias Array
            // project.removeDispo();
            var xToRemove = that.allDispos.length;
            console.log("removing medias with index X: " + xToRemove);
            $.each(project.allScenes, function(index, scene) {
                scene.allMedias = scene.allMedias.filter(function(media) {
                    return media.x !== xToRemove;
                });
            });
        }

        // CLEAR
        this.clearAll = function() {
            while (that.allDispos.length > 0) this.removeDispo()
        }

        // SAVE
        this.export = function() {
            // FILL EXPORT ARRAY
            poolExport = [];
            $.each(that.allDispos, function(index, dispo) {
                poolExport.push({
                    name: dispo.name,
                    operator: dispo.operator
                });
            });

            // SOCKETIO
            return poolExport
        }

    }



    ////////////////////////////////////////////////////////////
    /////////////////////////   DISPO   ////////////////////////
    ////////////////////////////////////////////////////////////

    function dispoObject(name, operator, xIndex) {

        var that = this;

        // input
        this.name = name;
        this.operator = operator;
        this.xIndex = xIndex;

        // divs
        this.dispoHeader = $('<th><div class="dispo"></div></th>').insertBefore('#addRemoveDispos');
        // naming
        this.dispoNaming = $('<div class="dispoNaming"></div>').appendTo(this.dispoHeader.children());
        this.operatorDiv = $('<div class="operatorEditor textbtn">' + that.operator + '</div>').appendTo(this.dispoNaming);
        this.nameDiv = $('<div class="nameEditor textbtn">' + that.name + '</div>').appendTo(this.dispoNaming);
        //stopper
        this.stop = $('<i class="fa fa-stop btn btnBig stopDispo" aria-hidden="true"></i>').appendTo(this.dispoHeader.children());
        //more btns
        this.dispoMore = $('<div class="dispoMore"></div>').appendTo(this.dispoHeader.children());
        this.mute = $('<i class="fa fa-volume-up btn btnMedium stateOn" aria-hidden="true"></i>').appendTo(this.dispoMore);
        this.loop = $('<i class="fa fa-repeat btn btnMedium stateOn" aria-hidden="true"></i>').appendTo(this.dispoMore);
        this.pause = $('<i class="fa fa-pause btn btnMedium stateOn" aria-hidden="true"></i>').appendTo(this.dispoMore);


        // CREATE BOXES
        this.allBoxes = new Array();
        $('.seqDiv').each(function(yIndex, seqdiv) {
            that.allBoxes.push(new boxObject(seqdiv, that, that.xIndex, yIndex));
        });

        // OPERATOR EDIT
        $(that.operatorDiv).click(function() {
            var thatOperatorDiv = this;
            if (editionMode == true) {
                $("#textToEditTitle").html("Nom de l'opérateur :");
                $("#textOverlay").fadeIn(fadeTime);
                $("#textToEdit").focus();
                $("#textToEdit").val(that.operator);
                $('#textToEdit').unbind().keypress(function(e) {
                    if (e.keyCode == 13) {
                        e.preventDefault();
                        thatOperatorDiv.validateText();
                    }
                });
                $('.validateText').unbind().click(function() { thatOperatorDiv.validateText(); });
            }
            //OK
            this.validateText = function() {
                $("#textToEdit").blur();
                $("#textOverlay").fadeOut(fadeTime);
                $(that.operatorDiv).html($("#textToEdit").val());
                that.operator = $("#textToEdit").val();
            }
        });

        // NAME EDIT
        this.bindDispoSelection = function() {
            $(that.nameDiv).unbind().click(function() {
                console.log('CLICK');
                var selectedDispo = 'none';
                if (editionMode == true) {
                    $('.listItem').removeClass('selected');
                    $("#dispoOverlay").fadeIn(fadeTime);
                    // select
                    // $(".dispoItem").unbind().click(function(){
                    // prefer this method so that if elements have been updated (".dispoItem" deleted & refilled) the event still works
                    // otherwise, user have to close & reopen window to bind ".dispoItem" click again
                    $(document).on("click", ".dispoItem", function() {
                        console.log('CLICK dispoItem');
                        selectedDispo = $(this).html();
                        $('.listItem').removeClass('selected');
                        $(this).addClass('selected');

                        $(".validateDispo").click()
                    });
                    // validate
                    $(".validateDispo").unbind().click(function() {
                        $("#dispoOverlay").fadeOut(fadeTime);
                        $(that.nameDiv).html(selectedDispo);
                        that.name = selectedDispo;
                        emitCtrl('register')
                        that.checkStates();
                    });

                }
            });
        }
        this.bindDispoSelection();

        // STATES - IN
        this.state = {
            'settings': { loop: 0, volume: 50, mute: false, audiomode: "stereo", pan: [100, 100], autoplay: false, flip: false },
            'status': { isPlaying: false, isPaused: false, media: null, time: 0, duration: 0 },
            'link': 0
        }

        this.justPlayed = false;

        // UPDATE specific part of dispo state
        this.updateState = function(key, data) {
            // update provided
            if (data !== undefined) {
                if (key == 'status') data = data[0] // keep status of first player only
                this.state[key] = data
            }

            if (key == 'status') {
                // pause
                let isPause = this.state['status']['isPaused']
                $(this.pause).toggleClass('stateOn', isPause)
                $(this.pause).toggleClass('stateOff', !isPause)

                // play state 
                let playbox = this.allBoxes.find(b => b.justPlayed)
                if (playbox) {
                    let isPlaying = this.state['status']['media'] && this.state['status']['media'].endsWith(playbox.media)
                    isPlaying = isPlaying && (this.state['status']['isPlaying'] || this.state['status']['isPaused'])

                    // console.log(isPlaying, this.state['status'])

                    if (isPlaying && this.state['status']['isPlaying'])
                        playbox.setStateIcon('play')
                    else if (isPlaying && this.state['status']['isPaused'])
                        playbox.setStateIcon('pause')
                    else
                        playbox.setStateIcon('stop')
                }
            } else if (key == 'settings') {
                // mute
                let isMute = this.state['settings']['mute']
                $(this.mute).toggleClass('stateOn', !isMute)
                $(this.mute).toggleClass('stateOff', isMute)

                // loop
                let isLoop = this.state['settings']['loop'] > 0
                $(this.loop).toggleClass('stateOn', isLoop)
                $(this.loop).toggleClass('stateOff', !isLoop)
            } else if (key == 'link') {
                // link
                let isLinked = this.state['link'] > 0
                this.dispoHeader.css({ opacity: (isLinked) ? 1.0 : 0.4 });
                this.allBoxes.forEach(b => b.updateOpacity((isLinked) ? 1.0 : 0.4))
            }
        }

        // FULL update
        this.checkStates = function() {
            for (let key in this.state) this.updateState(key)
        }


        // EMIT with name
        this.emit = function(event) {
            emitEvent({
                'peer': this.name,
                'event': event
            })
        }

        // INTERACTIONS - OUT
        this.stop.click(function() {
            that.emit('stop')
                // $.each(that.allBoxes,function(index,box){ 
                //   box.justPlayed=false; 
                //   $(box.box).removeClass('justPlayed'); 
                //   $(box.validPlayDiv).removeClass('validPlay-true'); 
                // });
        });

        this.pause.click(function() {
            if (that.state['status']['isPaused'])
                that.emit('resume')
            else if (that.state['status']['isPlaying'])
                that.emit('pause')
            console.warn(that.state['status']['isPaused'], that.state['status']['isPlaying'])
        });

        this.mute.click(function() {
            if (that.state['settings']['mute'])
                that.emit('unmute')
            else
                that.emit('mute')
        });

        this.loop.click(function() {
            if (that.state['settings']['loop'] > 0)
                that.emit('unloop')
            else
                that.emit('loop')
        });


        // init
        this.checkStates();

    }


    ////////////////////////////////////////////////////////////
    /////////////////////////   BOX     ////////////////////////
    ////////////////////////////////////////////////////////////

    function boxObject(seqdiv, dispo, xIndex, yIndex) {

        var that = this;
        this.box = $('<td class="box"></td>').appendTo($(seqdiv).parent());


        this.stateiDiv = $('<div class="stateiDiv">').appendTo(this.box)
        this.stateIcons = {
            play: $('<i class="fa fa-play" aria-hidden="true"></i>').appendTo(this.stateiDiv),
            pause: $('<i class="fa fa-pause" aria-hidden="true"></i>').appendTo(this.stateiDiv),
            stop: $('<i class="fa fa-stop" aria-hidden="true"></i>').appendTo(this.stateiDiv)
        }
        this.loopiDiv = $('<div class="loopiDiv">').appendTo(this.box)
        this.loopIcons = {
            loop: $('<i class="fa fa-repeat" aria-hidden="true"></i>').appendTo(this.loopiDiv),
            unloop: $('<i class="fa fa-share" aria-hidden="true"></i>').appendTo(this.loopiDiv),
        }

        this.mediaDiv = $('<div class="mediaSelector">...</div>').appendTo($(this.box));
        this.lightDiv = $('<div class="lightSelector"></div>').appendTo($(this.box));

        this.onendiDiv = $('<div class="onendiDiv">').appendTo(this.box)
        this.onendIcons = {
            next: $('<i class="fa fa-arrow-down" aria-hidden="true"></i>').appendTo(this.onendiDiv),
            prev: $('<i class="fa fa-arrow-up" aria-hidden="true"></i>').appendTo(this.onendiDiv),
            replay: $('<i class="fa fa-arrow-left" aria-hidden="true"></i>').appendTo(this.onendiDiv),
        }

        this.setStateIcon = function(state) {
            Object.values(this.stateIcons).every(i => i.hide())
            if (state in this.stateIcons) this.stateIcons[state].show()
        }

        this.setLoopIcon = function(loop) {
            Object.values(this.loopIcons).every(i => i.hide())
            if (loop in this.loopIcons) this.loopIcons[loop].show()
        }

        this.setOnendIcon = function(onend) {
            Object.values(this.onendIcons).every(i => i.hide())
            if (onend in this.onendIcons) this.onendIcons[onend].show()
        }


        this.media = '?';
        this.light = '?';
        this.loop = '?';
        this.dispo = dispo;
        this.xIndex = xIndex;
        this.yIndex = yIndex;

        // Media and loop from scenes data
        this.update = function() {
            let mediadata = project.activeScene().allMedias.find(m => (m.x == this.xIndex && m.y == this.yIndex))

            this.loop = mediadata.loop;
            this.onend = mediadata.onend;
            this.media = mediadata.media;
            this.light = mediadata.light;

            this.setLoopIcon(this.loop)
            this.setOnendIcon(this.onend)
            $(this.mediaDiv).html(this.media);
            $(this.lightDiv).html(this.light);
        }

        // Reset box 
        this.reset = function() {
            this.justPlayed = false
            $(this.box).removeClass('justPlayed');
            this.setStateIcon('none')
            this.update()
        }

        this.updateOpacity = function(op) {
            this.box.css({ opacity: op })
        }

        this.validPlay = function() {
            // $(this.validPlayDiv).addClass('validPlay-true');
        }

        $(this.box).click(function() {
            if (editionMode == true) {
                that.edit();
            } else {
                emitEvent(that.action())
            }
        });

        this.edit = function() {

            var selectedMedia = 'none';
            var selectedLight = 'none';
            $('.listItem').removeClass('selected');
            $("#mediaOverlay").fadeIn(fadeTime);

            // update Radio
            $('input:radio[name="loopArg"]').filter('[value="' + that.loop + '"]').prop('checked', true);

            // update Radio
            $('input:radio[name="onEndArg"]').filter('[value="' + that.onend + '"]').prop('checked', true);

            // update media
            $(".mediaItem").each(function(index, div) {
                if ($(div).html() == that.media) { $(div).addClass('selected'); }
            });

            // update light
            $(".lightItem").each(function(index, div) {
                if ($(div).html() == that.light) { $(div).addClass('selected'); }
            });


            // Picker (prevent selection)
            $(".mediaColorPicker").unbind().click(function(e) {
                e.stopPropagation()
            });


            // Select Media
            $(".mediaItem").unbind().click(function() {
                var selectedDiv = this;
                selectedMedia = $(this).html();

                $('.mediaItem').removeClass('selected');
                $(this).addClass('selected');

                // Color picker
                if ($(selectedDiv).hasClass('mediaColor')) {
                    selectedMedia = 'fade <span class="colorPreview" style="background-color:' + $(selectedDiv).find('.mediaColorPicker').val() + '">' + $(selectedDiv).find('.mediaColorPicker').val() + '</span>'
                }

                $(".validateMedia").click();
            });


            // Select Light
            $(".lightItem").unbind().click(function() {
                var selectedDiv = this;
                selectedLight = $(this).html();

                $('.lightItem').removeClass('selected');
                $(this).addClass('selected');

                // Color picker
                if ($(selectedDiv).hasClass('lightColor')) {
                    selectedLight = 'light <span class="colorPreview" style="background-color:' + $(selectedDiv).find('.mediaColorPicker').val() + '">' + $(selectedDiv).find('.mediaColorPicker').val() + '</span>'
                }
            });

            // validate
            ///////////////////////   SAVE BOX    //////////////////////
            $(".validateMedia").unbind().click(function() {

                $("#mediaOverlay").fadeOut(fadeTime);

                if (selectedMedia != 'none') { that.media = selectedMedia; }
                if (selectedLight != 'none') { that.light = selectedLight; }

                that.loop = $("input[name='loopArg']:checked").val();
                if (that.loop == undefined) { that.loop = 'none' }

                that.onend = $("input[name='onEndArg']:checked").val();
                if (that.onend == undefined) { that.onend = 'none' }

                $(that.mediaDiv).html(that.media);
                $(that.lightDiv).html(that.light);
                that.setLoopIcon(that.loop)
                that.setOnendIcon(that.onend)

                // Save it in project
                $.each(project.activeScene().allMedias, function(index, media) {
                    if ((media.x == that.xIndex) && (media.y == that.yIndex)) {
                        media.media = that.media;
                        media.light = that.light;
                        media.loop = that.loop;
                        media.onend = that.onend;
                        console.log('editing media x:' + that.xIndex + ' y:' + that.yIndex + ' ' + media.media + ' ' + media.light + ' ' + media.loop);
                    }
                });

            });

        }

        this.activeBox = function() {
            pool.allDispos.find(d => d.xIndex == that.xIndex).allBoxes.forEach(box => {
                box.justPlayed = false;
                $(box.box).removeClass('justPlayed');
                // $(box.validPlayDiv).removeClass('validPlay-true'); 
                box.setStateIcon('none')
            })

            that.justPlayed = true;
            $(that.box).addClass('justPlayed');
        }

        this.action = function() {

            // Build action
            var msg = { 'peer': this.dispo.name, 'synchro': true }

            if (this.media == 'stop') {
                this.activeBox()
                msg['event'] = 'stop'
            } else if (this.media == '...') {
                msg['event'] = 'continue'
            } else if (this.media == 'pause') {
                msg['event'] = 'pause'
            } else if (this.media == 'unfade') {
                msg['event'] = 'unfade'
            } else if (this.media.startsWith('fade')) {
                msg['event'] = 'fade'
                msg['data'] = $(this.media.split('fade ')[1]).text();
            } else {
                this.activeBox()
                scene = project.activeScene().name
                msg['event'] = 'play'
                msg['data'] = scene + '/' + this.media
            }

            cmds = [msg]

            if (this.loop == 'unloop')
                cmds.push({ 'peer': this.dispo.name, 'event': 'unloop' })
            else if (this.loop == 'loop')
                cmds.push({ 'peer': this.dispo.name, 'event': 'loop', 'data': 1 })

            if (this.light) {
                if (this.light.startsWith('light'))
                    cmds.push({
                        'peer': this.dispo.name,
                        'synchro': true,
                        'event': 'esp',
                        'data': {
                            'topic': 'leds/all',
                            'data': $(this.light.split('light ')[1]).text()
                        }
                    })

                else if (this.light.startsWith('preset'))
                    cmds.push({
                        'peer': this.dispo.name,
                        'synchro': true,
                        'event': 'esp',
                        'data': {
                            'topic': 'leds/mem',
                            'data': this.light.split('preset ')[1]
                        }
                    })

                else if (this.light.startsWith('off'))
                    cmds.push({
                        'peer': this.dispo.name,
                        'synchro': true,
                        'event': 'esp',
                        'data': {
                            'topic': 'leds/stop',
                            'data': ''
                        }
                    })
            }

            return cmds
        }

    }



    ////////////////////////////////////////////////////////////
    //////////////////////     PROJECT     /////////////////////
    ////////////////////////////////////////////////////////////

    allScenesTemp = ['scene1', 'scene2', 'scene3', 'scene4', 'scene5', 'scene6', 'scene7', 'scene8', 'scene9', 'scene10'];
    allSequencesTemp = ['seq1', 'seq2', 'seq3', 'seq4', 'seq5', 'seq6', 'seq7', 'seq8', 'seq9', 'seq10', 'seq11', 'seq12', 'seq13', 'seq14', 'seq15', 'seq16', 'seq17', 'seq18', 'seq19', 'seq20'];
    // projectExport = [];
    projectImport = [];

    var project = new projectObject()


    function projectObject() {

        var that = this;
        this.allScenes = new Array();

        // GET active Scene
        this.activeScene = function() {
            return this.allScenes.find(s => s.isActive)
        }

        // GET scene by Name
        this.sceneByName = function(name) {
            return this.allScenes.find(s => s.name == name)
        }

        // SAVE
        this.export = function() {
            // FILL EXPORT ARRAY
            var projectExport = [];
            // OLD WAY - SAVE ALL SCENES
            // projectExport.push(that.allScenes);
            // NEW WAY - SAVE ALL SCENES QUI SONT ONT UN DOSSIER CORRESPONDANT DANS LE FILETREE - Permet de supprimer les scenes qui n'ont pas de folder
            var allScenesExport = [];
            $.each(fileTree, function(index, folder) {
                $.each(that.allScenes, function(index, scene) {
                    if (scene.name == folder.name) { allScenesExport.push(scene); }
                });
            });
            projectExport.push(allScenesExport);

            if (projectExport.length == 0) {
                console.log('not saving empty project..')
                return
            }

            // SOCKETIO
            return projectExport
        }

        this.createScene = function(newFolderName) {
            var newScene = new sceneObject(newFolderName)
                // fill Sequences
            $.each(allSequencesTemp, function(index, seqName) {
                newScene.allSequences.push(seqName);
            });
            // fill medias
            $.each(pool.allDispos, function(indexX, dispo) {
                for (var indexY = 0; indexY < SEQ_SIZE; indexY++) {
                    newScene.allMedias.push(new media(indexX, indexY, '...', '...', 'none', 'none'));
                }
            });
            that.allScenes.push(newScene);
            return newScene
        }

    }



    // SCENE CHANGE

    bindSceneSelection = function() {
        $('.sceneEditor').unbind().click(function() {
            if (editionMode == true) {
                var selectedSceneName;
                $('.listItem').removeClass('selected');
                $("#sceneOverlay").fadeIn(fadeTime);
                // select
                // $(".sceneItem").unbind().click(function(){
                // prefer this method so that if elements have been updated (".sceneItem" deleted & refilled) the event still works
                // otherwise, user have to close & reopen window to bind ".sceneItem" click again
                $(document).on("click", ".sceneItem", function() {
                    console.log('scene item click');
                    selectedSceneName = $(this).html();
                    $('.listItem').removeClass('selected');
                    $(this).addClass('selected');
                });
                // validate
                $(".validateFoler").unbind().click(function() {
                    $("#sceneOverlay").fadeOut(fadeTime);
                    project.sceneByName(selectedSceneName).loadScene()
                });
            }
        });

    }

    bindSceneSelection();






    ////////////////////////////////////////////////////////////
    //////////////////////      SCENE      /////////////////////
    ////////////////////////////////////////////////////////////
    var fileTree = []

    function sceneObject(sceneName) {

        var that = this;
        this.isActive = false;
        this.name = sceneName;
        this.allSequences = new Array();
        this.allMedias = new Array();

        this.loadScene = function() {
            // set active
            $.each(project.allScenes, function(index, scene) { scene.isActive = false; });
            that.isActive = true;

            //scene names dom
            $('.seqName').each(function(index, div) {
                $(div).html(that.allSequences[index]);
            });

            // update boxes
            pool.allDispos.forEach(dispo => {
                dispo.allBoxes.forEach(box => {
                    box.reset()
                })
            })

            // mediaList in mediaOverlay
            that.updateMediasSelector();

            $('.sceneEditor').html(that.name);

            console.log('scene loaded: ' + that.name);
        }


        this.updateMediasSelector = function() {
            $('.mediaListDynamic').empty();
            $.each(fileTree, function(index, folder) {
                if (folder.name == that.name) {
                    $.each(folder.files, function(index, fileName) {
                        $('<div class="listItem mediaItem">' + fileName + '</div>').appendTo($('.mediaListDynamic'));
                    });
                }
            });
        }


    }

    ////////////////////////////////////////////////////////////
    //////////////////////     MEDIA     //////////////////////
    ////////////////////////////////////////////////////////////

    function media(x, y, media, light, loop, onend) {
        this.x = x;
        this.y = y;
        this.media = media;
        this.light = light;
        this.loop = loop;
        this.onend = onend;
    }




    ////////////////////////////////////////////////////////////
    //////////////////////    SEQUENCE    //////////////////////
    ////////////////////////////////////////////////////////////

    // SEQUENCE CHANGE
    var editedSequence;
    playSequenceArray = new Array();

    $('.seqName').click(function() {
        var that = this;
        editedSequence = this;
        var seqName = $(editedSequence).html();
        var sequenceNumber = $(this).parent().parent().index(); // sequence number / Y

        if (editionMode == true) {
            $("#textToEditTitle").html("Nom de la séquence :");
            $("#textOverlay").fadeIn(fadeTime);
            $("#textToEdit").focus();
            $("#textToEdit").val(seqName);
            $('#textToEdit').unbind().keypress(function(e) {
                if (e.keyCode == 13) {
                    e.preventDefault();
                    that.validateText();
                }
            });
            $('.validateText').unbind().click(function() { that.validateText(); });
        } else {
            allCmds = [];
            $.each(pool.allDispos, function(index, dispo) {
                $.each(dispo.allBoxes, function(index, box) {
                    if (box.yIndex == sequenceNumber)
                        allCmds = allCmds.concat(box.action());
                });
            });
            emitEvent(allCmds)
        }
        // OK
        this.validateText = function() {
            $("#textToEdit").blur();
            $("#textOverlay").fadeOut(fadeTime);
            $(editedSequence).html($("#textToEdit").val());
            project.activeScene().allSequences[sequenceNumber] = $("#textToEdit").val();
            // project.saveProject();
        }
    });


    // ERASE
    $(".eraseSequence").click(function() {
        var that = this;
        var sequenceNumber = $(this).parent().parent().parent().index();
        // data
        project.activeScene().allMedias.forEach(media => {
                if (media.y == sequenceNumber) {
                    media.media = '...';
                    media.light = '...';
                    media.loop = 'none';
                    media.onend = 'none';
                }
            })
            // dom
        $.each(pool.allDispos, function(index, dispo) {
            $.each(dispo.allBoxes, function(index, box) {
                if (box.yIndex == sequenceNumber) box.reset()
            });
        });

    });


    // COPY / PASTE
    var copying = false;
    var clipboard = [];
    $('.copyPasteSequence').click(function() {
        var that = this;
        var sequenceNumber = $(this).parent().parent().parent().index(); // sequence number / Y
        // COPY
        if (copying == false) {
            $('.copyPasteSequence').removeClass('fa-clipboard').addClass('fa-files-o');
            copying = true;
            clipboard = [];
            $.each(project.activeScene().allMedias, function(index, media) {
                if (media.y == sequenceNumber) { clipboard.push(media); }
            });
            return;
        }
        // PASTE
        if (copying == true) {
            $('.copyPasteSequence').removeClass('fa-files-o').addClass('fa-clipboard');
            copying = false;

            // memory
            $.each(project.activeScene().allMedias, function(index, media) {
                if (media.y == sequenceNumber) {
                    $.each(clipboard, function(index, clipboardmedia) {
                        if (media.x == clipboardmedia.x) {
                            media.media = clipboardmedia.media;
                            media.light = clipboardmedia.light;
                            media.loop = clipboardmedia.loop;
                            media.onend = clipboardmedia.onend;
                        }
                    });
                }
            });

            // Dom
            $.each(clipboard, function(index, media) {
                $.each(pool.allDispos, function(index, dispo) {
                    $.each(dispo.allBoxes, function(index, box) {
                        if ((box.xIndex == media.x) && (box.yIndex == sequenceNumber)) box.reset()
                    });
                });
            });

            // project.saveProject();
            return;
        }



    });


    ////////////////////////////////////////////////////////////
    ///////////////////////   INCOMING  ////////////////////////
    ////////////////////////////////////////////////////////////


    ////////////////////////   FILES  /////////////////////////
    function updateFileTree() {

        // DOM
        $('.sceneList').empty();
        $.each(fileTree, function(index, folder) {
            $('<div class="listItem sceneItem">' + folder.name + '</div>').appendTo($('.sceneList'));
        });

        bindSceneSelection();

        // NEW SCENE (IF NEW FOLDER)
        var allSceneNames = [];
        $.each(project.allScenes, function(index, scene) { allSceneNames.push(scene.name); });
        $.each(fileTree, function(index, folder) {
            if ($.inArray(folder.name, allSceneNames) == -1) {
                project.createScene(folder.name);
            }
        });
        // pas besoin de supprimer scene si folder en moins, car à la sauvegarde on  ne sauve que les scenes qui ont un folder correspondant
        // see projectObject.saveProject()

        // update Active Scene Medias
        if (project.activeScene())
            project.activeScene().updateMediasSelector()
    }



    ////////////////////////   DISPOS   /////////////////////////

    var dispoNames = []

    function updateDispo(name, key, data) {
        // name list
        if (!dispoNames.includes(name)) {

            dispoNames.push(name)

            $(".dispoList").empty();
            for (let name of dispoNames.sort())
                $('<div class="listItem dispoItem">' + name + '</div>').appendTo($('.dispoList'));

            pool.allDispos.forEach(d => d.bindDispoSelection())
        }

        // update state
        dispos = pool.allDispos.filter(d => d.name == name)
        for (let d of dispos) d.updateState(key, data)

    }

    ///////////////////////////////////////////////////////////
    ///////////////////////   SAVE ALL  ////////////////////////
    ////////////////////////////////////////////////////////////

    function saveAll() {
        data = {}
        data['pool'] = pool.export();
        data['project'] = project.export();

        console.log('saving', data)

        socket.emit('save', JSON.stringify(data, null, "\t"))

        // TODO: fallback to AJAX -> /data/save.php (type project) if socketio not available)

    }



    ////////////////////////////////////////////////////////////
    ///////////////////////   SOCKETIO  ////////////////////////
    ////////////////////////////////////////////////////////////

    var fuzzyTest = 300

    function fuzzy() {
        $('#seq1').click()
        fuzzyTest -= 10
        if (fuzzyTest <= 50) fuzzyTest = 300
        setTimeout(fuzzy, fuzzyTest)
    }

    // url = 'casa.local:9111';
    url = window.location.host;
    var socket = io(url);

    // CONNECT
    socket.on('connect', function() {
        console.log('Connected to Server: ' + url);
        $('.connectionStateText').text('connecté');
        $('.connectionState').removeClass('disconnected').addClass('connected');

        emitCtrl('init')

        // TODO: fallback to AJAX -> /data/load.php (type project) if socketio not available)
    });

    socket.on('disconnect', function() {
        $('.connectionStateText').text('recherche');
        $('.connectionState').removeClass('connected').addClass('disconnected');
    });


    // RECEIVE LOAD DATA
    socket.on('data', (data) => {

        console.log('loading', data)

        // SAVED DATA
        if ('fullproject' in data) {
            // PARSE JSON
            let fullproject = JSON.parse(data['fullproject']);

            // POOL
            pool.clearAll()
            $.each(fullproject['pool'], function(index, dispo) {
                pool.allDispos.push(new dispoObject(dispo.name, dispo.operator, index));
            });

            // SAVE ACTIVE SCENE
            var nameOfActiveScene;
            for (scene of project.allScenes)
                if (scene.isActive) nameOfActiveScene = scene.name

                // PROJECT
            project.allScenes = [];
            let projectImport = fullproject['project'];

            // SCENES
            $.each(projectImport[0], function(index, incomingScene) {

                // import scene
                newScene = project.createScene(incomingScene.name)

                // sequences (import and complete with empty)
                newScene.allSequences = projectImport[0][index].allSequences
                for (var y = newScene.allSequences.length; y < SEQ_SIZE; y++)
                    newScene.allSequences.push('seq' + y)

                // medias
                $.each(newScene.allMedias, (i, media) => {
                    m = projectImport[0][index].allMedias.find(m => (m.x == media.x && m.y == media.y))
                    if (m) newScene.allMedias[i] = m;
                });

            });

        }

        // FILETREE
        if ('fileTree' in data) {
            fileTreePrepared = []
            k = 0
            for (key in data['fileTree'])
                fileTreePrepared[k++] = {
                    'name': key,
                    'files': data['fileTree'][key]
                }

            // Check any variation of filetree 
            if (JSON.stringify(fileTree) != JSON.stringify(fileTreePrepared)) {
                fileTree = fileTreePrepared;
                updateFileTree();
            }
        }

        // LOAD LAST ACTIVE SCENE
        if ('fullproject' in data) {
            let lastActiveScenes = project.allScenes.filter(scene => scene.name == nameOfActiveScene)
            if (lastActiveScenes.length == 0) lastActiveScenes = [project.allScenes[0]]
            if (lastActiveScenes[0]) {
                lastActiveScenes[0].loadScene()
                $('.sceneEditor').html(lastActiveScenes[0].name)
            }

            emitCtrl('register')
        }

    })


    // RECEIVE DISPO STATUS
    socket.on('dispo', (data) => {
        console.log(data['name'], data['type'], data['data'])
        updateDispo(data['name'], data['type'], data['data'])
    })

    // SEND to Regie controller
    function emitCtrl(msg, data) {
        socket.emit(msg, data)
        console.log(msg, data);
    }

    function emitEvent(msg) {
        if (!Array.isArray(msg)) msg = [msg]
        socket.emit('event', msg)
        console.log('event', msg)
    }























});