
$(function() {

  $('.overlay').css('opacity','1').hide();

  ////////////////////////////////////////////////////////////
  /////////////////////////  GENERAL  ////////////////////////
  ////////////////////////////////////////////////////////////

  var editionMode = true;
  var expandedMode = true;
  var fadeTime = 200;

  $('.dispoToggle').click(function(){
    // $('.dispoMore').slideToggle(200);
    if(expandedMode==true){
      $('.dispoToggle').removeClass('fa-chevron-down').addClass('fa-chevron-up');
      $('#addRemoveDispos').fadeIn(fadeTime);
      $('.dispoMore').slideDown(fadeTime,function(){
        expandedMode=false;
      });
    }
    if(expandedMode==false){
      $('.dispoToggle').removeClass('fa-chevron-up').addClass('fa-chevron-down');
      $('#addRemoveDispos').fadeOut(fadeTime);
      $('.dispoMore').slideUp(fadeTime,function(){
        expandedMode=true;
      });
    }

  });

  $('.editToggle').click(function(){
    if(editionMode==true){
      $('.editToggle').removeClass('btnOn').addClass('btnOff');
      $('body').removeClass('editionMode').addClass('playMode');
      // $('.textbtn').addClass('btn');
      $('.textbtn').each(function(index,div){ $(div).removeClass('btn'); });
      $('.seqControls').fadeOut(fadeTime,function(){
        editionMode=false;
      });
    }
    if(editionMode==false){
      $('.editToggle').removeClass('btnOff').addClass('btnOn');
      $('body').removeClass('playMode').addClass('editionMode');
      // $('.textbtn').removeClass('btn');
      $('.textbtn').each(function(index,div){ $(div).addClass('btn'); });
      $('.seqControls').fadeIn(fadeTime,function(){
        editionMode=true;
      });
    }
  });


  ///////// Overlay Closer
  $(".overlay").click(function(e){

    if (e.target !== this){return;}
    else{ $(this).fadeOut(fadeTime); }

  });


  ///////// Add dispo
  $('.addDispo').click(function(){
    pool.addDispo();
  });
  ///////// Add dispo
  $('.removeDispo').click(function(){
    pool.removeDispo();
  });


  $('.stopAll').click(function(){
    console.log('STOP ALL');
  });
  // $('.listItem').click(function(){
  //   $('.listItem').removeClass('selected'); $(this).addClass('selected');
  // });




  ////////////////////////////////////////////////////////////
  /////////////////////////    POOL   ////////////////////////
  ////////////////////////////////////////////////////////////

  pool = new poolObject();
  poolExport = [];
  poolImport = [];

  function poolObject(){

    var that = this;
    that.allDispos = new Array();

    // ADD
    this.addDispo = function(){
      var xIndex = that.allDispos.length-1;
      that.allDispos.push(new dispoObject('name dispo','name operator', xIndex));
      // Expand allMedias Array
      // project.addDispo();
      var xToAdd = that.allDispos.length-1;
      console.log("adding medias with index X: "+xToAdd);
      $.each(project.allScenes,function(index,scene){
        for (var indexY = 0; indexY < 20; indexY++) {
          scene.allMedias.push(new media(xToAdd,indexY,'...','none'));
        }
      });


    }
    // DEV
    this.removeDispo = function(){
      // remove dispo & dispo div
      that.allDispos.pop();
      $("#dispos").find('th:nth-last-child(2)').remove();
      // Remove boxes
      $('.seqLine').each(function(index,div){
        $(div).find('.box:last-child').remove();
      });
      // Reduce allMedias Array
      // project.removeDispo();
      var xToRemove = that.allDispos.length;
      console.log("removing medias with index X: "+xToRemove);
      $.each(project.allScenes,function(index,scene){
        scene.allMedias = scene.allMedias.filter(function( media ) {
          return media.x !== xToRemove;
        });
      });

    }

    // SAVE - interval
    this.savePoolInterval = function(){
      setInterval(function(){
        that.savePool();
      }, 10000);
    }
    // SAVE
    this.savePool = function(){
      // FILL EXPORT ARRAY
      poolExport = [];
      $.each(that.allDispos,function(index,dispo){
        poolExport.push({
          name:dispo.name,
          operator:dispo.operator
        });
      });
      // AJAX
      $.ajax({
        url: "data/save.php",
        dataType: "json",
        type: "POST",
        data: {
            contents: JSON.stringify(poolExport),
            filename: 'pool',
            timestamp: $.now(),
            type: 'pool'
        }
      })
      .done(function(reponse){
        // console.log(reponse.status);
      })
      .fail(function(){
        // console.log('save failed');
      });
    }


    this.loadPool = function(){
      $.ajax({
        url: "data/load.php",
        dataType: "json",
        type: "POST",
        data: {
            filename: 'pool',
            type: 'pool'
        }
      })
      .done(function(reponse) {
        if (reponse.status == 'success')
        {
          poolImport = JSON.parse(reponse.contents);
          $.each(poolImport, function( index, dispo ) {
            that.allDispos.push(new dispoObject(dispo.name, dispo.operator, index));
          });
          initProject();
        }
      });
    }

    // INIT POOL
    this.loadPool();
    this.savePoolInterval();

  }



  ////////////////////////////////////////////////////////////
  /////////////////////////   DISPO   ////////////////////////
  ////////////////////////////////////////////////////////////

  function dispoObject(name, operator, xIndex){

    var that = this;

    // input
    this.name = name;
    this.operator = operator;
    this.xIndex = xIndex;

    // divs
    this.dispoHeader = $('<th><div class="dispo"></div></th>').insertBefore('#addRemoveDispos');
    // naming
    this.dispoNaming =$('<div class="dispoNaming"></div>').appendTo(this.dispoHeader.children());
    this.operatorDiv = $('<div class="operatorEditor textbtn btn">'+that.operator+'</div>').appendTo(this.dispoNaming);
    this.nameDiv = $('<div class="nameEditor textbtn btn">'+that.name+'</div>').appendTo(this.dispoNaming);
    //stopper
    this.stop = $('<i class="fa fa-stop btn btnBig stopDispo" aria-hidden="true"></i>').appendTo(this.dispoHeader.children());
    //more btns
    this.dispoMore =$('<div class="dispoMore"></div>').appendTo(this.dispoHeader.children());
    this.mute = $('<i class="fa fa-volume-up btn btnMedium" aria-hidden="true"></i>').appendTo(this.dispoMore);
    this.loop = $('<i class="fa fa-repeat btn btnMedium" aria-hidden="true"></i>').appendTo(this.dispoMore);
    this.pause = $('<i class="fa fa-pause btn btnMedium" aria-hidden="true"></i>').appendTo(this.dispoMore);


    this.allBoxes = new Array();
    $('.seqDiv').each(function(yIndex,seqdiv){
      that.allBoxes.push(new boxObject(seqdiv,that.name, that.xIndex, yIndex));
    });

    // Connection State
    this.connected = true;

    this.updateConnectionState = function(){
      if(that.connected==false){
        this.dispoHeader.css({opacity:0.4});
        $.each(that.allBoxes,function(index,box){ box.updateConnectionState('disconnected'); });
      }
      if(that.connected==true){
        this.dispoHeader.css({opacity:1});
        $.each(that.allBoxes,function(index,box){ box.updateConnectionState('connected'); });
      }
    }

    // OPERATOR EDIT
    $(that.operatorDiv).click(function(){
      var thatOperatorDiv = this;
      if(editionMode==true){
        $("#textToEditTitle").html("Nom de l'opérateur :");
        $("#textOverlay").fadeIn(fadeTime);
        $("#textToEdit").focus();
        $("#textToEdit").val(that.operator);
        $('#textToEdit').unbind().keypress(function(e){ if(e.keyCode == 13){ e.preventDefault(); thatOperatorDiv.validateText(); } });
        $('.validateText').unbind().click(function(){ thatOperatorDiv.validateText(); });
      }
      //OK
      this.validateText = function(){
        $("#textToEdit").blur();
        $("#textOverlay").fadeOut(fadeTime);
        $(that.operatorDiv).html($("#textToEdit").val());
        that.operator = $("#textToEdit").val();
        pool.savePool();
      }
    });

    // NAME EDIT
    $(that.nameDiv).click(function(){
      var selectedDispo = 'none';
      if(editionMode==true){
        $('.listItem').removeClass('selected');
        $("#dispoOverlay").fadeIn(fadeTime);
        // select
        $(".dispoItem").unbind().click(function(){
          selectedDispo = $(this).html();
          $('.listItem').removeClass('selected'); $(this).addClass('selected');
        });
        // validate
        $(".validateDispo").unbind().click(function(){
          $("#dispoOverlay").fadeOut(fadeTime);
          $(that.nameDiv).html(selectedDispo);
          that.name = selectedDispo;
          pool.savePool();
        });

      }
    });

    // INTERACTIONS - OUT
    this.stop.click(function(){
      console.log('STOP /dispo '+that.name);
    });

    this.mute.click(function(){
      console.log('MUTE /dispo '+that.name);
    });

    this.loop.click(function(){
      console.log('LOOP /dispo '+that.name);
    });

    this.pause.click(function(){
      console.log('PAUSE  /dispo '+that.name);
    });



    // init
    this.updateConnectionState();

  }


  ////////////////////////////////////////////////////////////
  /////////////////////////   BOX     ////////////////////////
  ////////////////////////////////////////////////////////////

  function boxObject(seqdiv, dispo, xIndex, yIndex){

    var that = this;
    this.box = $('<td class="box"></td>').appendTo($(seqdiv).parent());
    this.mediaDiv = $('<div class="mediaSelector">...</div>').appendTo($(this.box));
    this.loopDiv = $('<div class="loopInfo"><i class="fa fa-repeat loopInfoIcon loopInfo-none" aria-hidden="true"></i></div>').appendTo($(this.box));
    this.media='?';
    this.loop='?';
    this.dispo = dispo;
    this.xIndex = xIndex;
    this.yIndex = yIndex;

    this.getMedia = function(){
      that.media = $(that.box).text();
      if($(that.loopDiv).find('.loopInfoIcon').hasClass('loopInfo-none')){ that.loop = 'none'; }
      if($(that.loopDiv).find('.loopInfoIcon').hasClass('loopInfo-loop')){ that.loop = 'loop'; }
      if($(that.loopDiv).find('.loopInfoIcon').hasClass('loopInfo-unloop')){ that.loop = 'unloop'; }
    }

    this.setMedia = function(media,loop){
      that.loop = loop;
      that.media = media;
      $(that.loopDiv).find('.loopInfoIcon').removeClass('loopInfo-none').removeClass('loopInfo-loop').removeClass('loopInfo-unloop').addClass('loopInfo-'+that.loop);
      $(that.mediaDiv).html(that.media);
    }

    this.updateConnectionState = function(state){
      if(state=='disconnected'){
        this.box.css({opacity:0.4});
      }
      if(state=='connected'){
        this.box.css({opacity:1});
      }
    }

    $(this.box).click(function(){
      if(editionMode==true){
        that.edit();
      }else{
        that.play();
      }
    });

    this.edit=function(){

      var selectedMedia = 'none';
      $('.listItem').removeClass('selected');
      $("#mediaOverlay").fadeIn(fadeTime);
      // update that.media (because on init (loadPool & loadProject), loadProject edits scene obj -> media + DOM but not box object )
      that.media=$(that.box).text();
      bindColorPicker();
      // Radio
      $("input[name='loopArg']").each(function(){
        $(this).prop('checked', false);
      });

      // Select
      $(".mediaItem").unbind().click(function(){
        var selectedDiv = this;
        selectedMedia = $(this).html();
        $('.listItem').removeClass('selected'); $(this).addClass('selected');
        // Color picker
        // if( media = color ) bindColorPicker PLUS change selected media
        if($(selectedDiv).hasClass('mediaColor')){
          $("#mediaColorEdit").unbind().on('change',function(){
            $('.mediaColor').html('color '+$("#mediaColorEdit").val());
            selectedMedia = 'color '+$("#mediaColorEdit").val();
          });
        }

      });

      // validate
      ///////////////////////   SAVE BOX    //////////////////////
      $(".validateMedia").unbind().click(function(){

        $("#mediaOverlay").fadeOut(fadeTime);
        that.media = selectedMedia;
        that.loop = $("input[name='loopArg']:checked").val();
        if(that.loop==undefined){ that.loop = 'none' }
        if(that.media=='none'){ that.media = '...'; }
        $(that.loopDiv).find('.loopInfoIcon').removeClass('loopInfo-none').removeClass('loopInfo-loop').removeClass('loopInfo-unloop').addClass('loopInfo-'+that.loop);
        $(that.mediaDiv).html(that.media);

        // Save it in project
        // var xIndex = $(that.box).index()-1;
        // var yIndex = $(that.box).parent().index();
        $.each(project.allScenes,function(index,scene){
          if(scene.isActive==true){
            $.each(scene.allMedias,function(index,media){
              if((media.x==that.xIndex)&&(media.y==that.yIndex)){
                media.media = that.media;
                media.loop = that.loop;
                console.log('editing media x:'+that.xIndex+' y:'+that.yIndex+' '+media.media+' '+media.loop);
              }
            });
          }
        });
        project.saveProject();

      });

    }

    this.play=function(){
      that.getMedia();
      console.log('PLAY /dispo '+that.dispo+' /media '+that.media+' /loop '+that.loop+' x '+that.xIndex+' y '+that.yIndex);
    }

  }

    ///////////////////    BOX - MORE    /////////////////////

    function bindColorPicker(){
      $("#mediaColorEdit").unbind().on('change',function(){
        $('.mediaColor').html('color '+$("#mediaColorEdit").val());
      });
    }



  ////////////////////////////////////////////////////////////
  //////////////////////     PROJECT     /////////////////////
  ////////////////////////////////////////////////////////////

  allScenesTemp = ['scene1','scene2','scene3','scene4','scene5','scene6','scene7','scene8','scene9','scene10'];
  allSequencesTemp = ['seq1','seq2','seq3','seq4','seq5','seq6','seq7','seq8','seq9','seq10','seq11','seq12','seq13','seq14','seq15','seq16','seq17','seq18','seq19','seq20' ];
  projectExport = [];
  projectImport = [];

  var project;


  function initProject(){
    project = new projectObject();
    project.loadProject();
  }


  function projectObject(){

    var that = this;
    that.allScenes = new Array();

    // SAVE - interval
    this.saveProjectInterval = function(){
      setInterval(function(){
        that.saveProject();
      }, 2000);
    }

    // SAVE
    this.saveProject = function(){
      // FILL EXPORT ARRAY
      projectExport = [];
      projectExport.push(that.allScenes);
      // console.log(projectExport[0][0].allSequences);
      // AJAX
      $.ajax({
        url: "data/save.php",
        dataType: "json",
        type: "POST",
        data: {
            contents: JSON.stringify(projectExport),
            filename: 'project',
            timestamp: $.now(),
            type: 'project'
        }
      })
      .done(function(reponse){
        // console.log(reponse.status);
      })
      .fail(function(){
        // console.log('save failed');
      });
    }


    this.loadProject = function(){
      $.ajax({
        url: "data/load.php",
        dataType: "json",
        type: "POST",
        data: {
            filename: 'project',
            type: 'project'
        }
      })
      .done(function(reponse) {
        if (reponse.status == 'success')
        {
          // FROM JSON
          that.allScenes=[];
          projectImport = JSON.parse(reponse.contents);
          // NEW SCENES
          $.each(projectImport[0], function( index, incomingScene ) {
            that.allScenes.push(new sceneObject(incomingScene.name) );
          });
          // EDIT SCENE
          $.each(that.allScenes,function(index,newScene){
            // sequences
            $.each(projectImport[0][index].allSequences,function(index,seqName){
              newScene.allSequences.push(seqName);
            });
            // medias
          $.each(projectImport[0][index].allMedias,function(index,incomingMedia){
              newScene.allMedias.push(new media(incomingMedia.x,incomingMedia.y,incomingMedia.media,incomingMedia.loop));
            });
          });

          // // FROM SCRATCH
          // NEW SCENES
          // $.each(allScenesTemp,function(index){
          //   that.allScenes.push(new sceneObject(allScenesTemp[index]) );
          // });
          // // EDIT SCENE
          // $.each(that.allScenes,function(index,scene){
          //   // scene.allSequences = allSequencesTemp;
          //   $.each(allSequencesTemp,function(index,seqName){
          //     scene.allSequences.push(seqName);
          //   });
          //   $.each(pool.allDispos,function(indexX,dispo){
          //     for (var indexY = 0; indexY < 20; indexY++) {
          //       scene.allMedias.push(new media(indexX,indexY,'...','none'));
          //     }
          //   });
          // });

          // LOAD FIRST SCENE
          project.allScenes[0].loadScene();
          $('.sceneEditor').html(project.allScenes[0].name);
        }
      });

    }



    this.saveProjectInterval();


  }


  // SCENE CHANGE
  $('.sceneEditor').click(function(){
    if(editionMode==true){
      var selectedSceneName;
      $('.listItem').removeClass('selected');
      $("#sceneOverlay").fadeIn(fadeTime);
      // select
      $(".sceneItem").unbind().click(function(){
        selectedSceneName = $(this).html();
        $('.listItem').removeClass('selected'); $(this).addClass('selected');
      });
      // validate
      $(".validateFoler").unbind().click(function(){
        $("#sceneOverlay").fadeOut(fadeTime);
        $('.sceneEditor').html(selectedSceneName);
        $.each(project.allScenes,function(index,scene){
          if(scene.name==selectedSceneName){ scene.loadScene(); }
        });
      });
    }
  });




  ////////////////////////////////////////////////////////////
  //////////////////////      SCENE      /////////////////////
  ////////////////////////////////////////////////////////////


  function sceneObject(sceneName){

    var that = this;
    this.isActive = false;
    this.name = sceneName;
    this.allSequences = new Array();
    this.allMedias = new Array();


    this.loadScene = function(){
      // active
      $.each(project.allScenes,function(index,scene){ scene.isActive=false; });
      that.isActive = true;
      //scene names dom
      $('.seqName').each(function(index,div){
        $(div).html(that.allSequences[index]);
      });
      //medias
      // $.each(that.allMedias,function(index,media){
      //   $('.box').each(function(index,div){
      //     var xIndex = $(div).index()-1;
      //     var yIndex = $(div).parent().index();
      //     if((xIndex==media.x)&&(yIndex==media.y)){
      //       $(this).find('.mediaSelector').html(media.media);
      //       $(this).find('.loopInfoIcon').removeClass('loopInfo-none').removeClass('loopInfo-loop').removeClass('loopInfo-unloop').addClass('loopInfo-'+media.loop);
      //     }
      //   });
      // });
      $.each(that.allMedias,function(index,media){
        $.each(pool.allDispos,function(index,dispo){
          $.each(dispo.allBoxes,function(index,box){
            if((box.xIndex==media.x)&&(box.yIndex==media.y)){
              box.setMedia(media.media,media.loop)
            }
          });
        });
      });


      console.log('scene loaded: '+that.name);
    }


  }

  ////////////////////////////////////////////////////////////
  //////////////////////     MEDIA     //////////////////////
  ////////////////////////////////////////////////////////////

  function media(x,y,media,loop){
    this.x = x;
    this.y = y;
    this.media = media;
    this.loop = loop;
  }




  ////////////////////////////////////////////////////////////
  //////////////////////    SEQUENCE    //////////////////////
  ////////////////////////////////////////////////////////////

  // SEQUENCE CHANGE
  var editedSequence;

  $('.seqName').click(function(){
    var that = this;
    editedSequence = this;
    var seqName = $(editedSequence).html();
    var sequenceNumber = $(this).parent().parent().index(); // sequence number / Y

    if(editionMode==true){
      $("#textToEditTitle").html("Nom de la séquence :");
      $("#textOverlay").fadeIn(fadeTime);
      $("#textToEdit").focus();
      $("#textToEdit").val(seqName);
      $('#textToEdit').unbind().keypress(function(e){ if(e.keyCode == 13){ e.preventDefault(); that.validateText(); } });
      $('.validateText').unbind().click(function(){ that.validateText(); });
    }else{
      console.log('play sequence');
      $.each(pool.allDispos,function(index,dispo){
        $.each(dispo.allBoxes,function(index,box){
          if(box.yIndex==sequenceNumber){box.play();}
        });
      });
    }
    // OK
    this.validateText = function(){
      $("#textToEdit").blur();
      $("#textOverlay").fadeOut(fadeTime);
      $(editedSequence).html($("#textToEdit").val());
      $.each(project.allScenes,function(index,scene){
        if(scene.isActive==true){
          scene.allSequences[sequenceNumber] = $("#textToEdit").val();
        }
      });
      project.saveProject();
    }
  });


  // ERASE
  $(".eraseSequence").click(function(){
    var that=this;
    var sequenceNumber = $(this).parent().parent().parent().index();
    // dom
    // var seqLine = $(this).parent().parent().parent();
    // $(seqLine).find('.box').each(function(index,box){
    //   $(box).find('.mediaSelector').html('...');
    //   $(box).find('.loopInfoIcon').removeClass('loopInfo-loop').removeClass('loopInfo-unloop').addClass('loopInfo-none');
    // });
    $.each(pool.allDispos,function(index,dispo){
      $.each(dispo.allBoxes,function(index,box){
        if(box.yIndex==sequenceNumber){box.setMedia('...','none');}
      });
    });
    // data
    $.each(project.allScenes,function(index,scene){
      if(scene.isActive==true){
        $.each(scene.allMedias,function(index,media){
          if(media.y==sequenceNumber){ media.media='...'; media.loop='none'; }
        });
      }
    });
  });


  // COPY / PASTE
  var copying = false;
  var clipboard = [];
  $('.copyPasteSequence').click(function(){
    var that = this;
    var sequenceNumber = $(this).parent().parent().parent().index(); // sequence number / Y
    // COPY
    if(copying==false){
      $('.copyPasteSequence').removeClass('fa-clipboard').addClass('fa-files-o');
      copying=true;
      clipboard = [];
      $.each(project.allScenes,function(index,scene){
        if(scene.isActive==true){
          $.each(scene.allMedias,function(index,media){
            if(media.y==sequenceNumber){clipboard.push(media);}
          });
        }
      });
      return;
    }
    // PASTE
    if(copying==true){
      $('.copyPasteSequence').removeClass('fa-files-o').addClass('fa-clipboard');
      copying=false;
      // Dom
      // dom - Media
      // $(that).parent().parent().parent().find('.mediaSelector').each(function(indexX,div){
      //   $.each(clipboard,function(index,media){
      //     if(media.x==indexX){ $(div).html(media.media); }
      //   });
      // });
      // // dom - loop
      // $(that).parent().parent().parent().find('.loopInfoIcon').each(function(indexX,div){
      //   $.each(clipboard,function(index,media){
      //     if(media.x==indexX){ $(div).removeClass('loopInfo-none').removeClass('loopInfo-loop').removeClass('loopInfo-unloop').addClass('loopInfo-'+media.loop); }
      //   });
      // });
      $.each(clipboard,function(index,media){
        $.each(pool.allDispos,function(index,dispo){
          $.each(dispo.allBoxes,function(index,box){
            if((box.xIndex==media.x)&&(box.yIndex==sequenceNumber)){
              box.setMedia(media.media,media.loop)
            }
          });
        });
      });

      // memory
      $.each(project.allScenes,function(index,scene){
        if(scene.isActive==true){
          $.each(scene.allMedias,function(index, media){
            if(media.y==sequenceNumber){
              $.each(clipboard,function(index, clipboardmedia){
                if(media.x==clipboardmedia.x){ media.media = clipboardmedia.media; media.loop = clipboardmedia.loop; }
              });
              console.log(media);
            }
          });
        }
      });
      project.saveProject();
      return;
    }



  });


  ////////////////////////////////////////////////////////////
  ////////////////////////   SOCKET   ////////////////////////
  ////////////////////////////////////////////////////////////

























});
