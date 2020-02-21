
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
      $('.seqControls').fadeOut(fadeTime,function(){
        editionMode=false;
      });
    }
    if(editionMode==false){
      $('.editToggle').removeClass('btnOff').addClass('btnOn');
      $('body').removeClass('playMode').addClass('editionMode');
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
      that.allDispos.push(new dispoObject('name dispo','name operator'));
    }
    // DEV
    this.removeDispo = function(){
      // remove dispo & dispo div
      that.allDispos.pop();
      $("#dispos").find('th:nth-last-child(2)').remove();
      // REMOVE MEDIA IN SCENE TO !! TODO
      $('.seqLine').each(function(index,div){
        $(div).find('.box:last-child').remove();
      });

    }

    // SAVE - interval
    this.savePoolInterval = function(){
      setInterval(function(){
        that.fillExportArray();
        that.savePool();
      }, 10000);
    }
    // SAVE - Pre export array
    this.fillExportArray = function(){
      poolExport = [];
      $.each(that.allDispos,function(index,dispo){
        poolExport.push({
          name:dispo.name,
          operator:dispo.operator
        });
      });
    }
    // SAVE - for real
    this.savePool = function(){
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
            that.allDispos.push(new dispoObject(dispo.name, dispo.operator));
          });
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

  function dispoObject(name, operator){

    var that = this;

    // input
    this.name = name;
    this.operator = operator;

    // divs
    this.dispoHeader = $('<th><div class="dispo"></div></th>').insertBefore('#addRemoveDispos');
    // naming
    this.dispoNaming =$('<div class="dispoNaming"></div>').appendTo(this.dispoHeader.children());
    this.operatorDiv = $('<div class="operatorEditor">'+that.operator+'</div>').appendTo(this.dispoNaming);
    this.nameDiv = $('<div class="nameEditor">'+that.name+'</div>').appendTo(this.dispoNaming);
    //stopper
    this.stop = $('<i class="fa fa-stop btnBig stopDispo" aria-hidden="true"></i>').appendTo(this.dispoHeader.children());
    //more btns
    this.dispoMore =$('<div class="dispoMore"></div>').appendTo(this.dispoHeader.children());
    this.mute = $('<i class="fa fa-volume-up btnMedium" aria-hidden="true"></i>').appendTo(this.dispoMore);
    this.loop = $('<i class="fa fa-repeat btnMedium" aria-hidden="true"></i>').appendTo(this.dispoMore);
    this.pause = $('<i class="fa fa-pause btnMedium" aria-hidden="true"></i>').appendTo(this.dispoMore);


    this.allBoxes = new Array();
    $('.seqDiv').each(function(index,div){
      that.allBoxes.push(new boxObject(div));
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
        });
      }
    });


    // init
    this.updateConnectionState();

  }


  ////////////////////////////////////////////////////////////
  /////////////////////////   BOX     ////////////////////////
  ////////////////////////////////////////////////////////////

  function boxObject(div){

    this.box = $('<td class="box"></td>').appendTo($(div).parent());
    this.mediaDiv = $('<div class="mediaSelector">...</div>').appendTo($(this.box));
    var that = this;
    this.media='?';

    this.updateConnectionState = function(state){
      if(state=='disconnected'){
        this.box.css({opacity:0.4});
      }
      if(state=='connected'){
        this.box.css({opacity:1});
      }
    }

    $(this.box).click(function(){
      var selectedMedia = 'none';
      if(editionMode==true){
        $('.listItem').removeClass('selected');
        $("#mediaOverlay").fadeIn(fadeTime);
        // select
        $(".mediaItem").unbind().click(function(){
          selectedMedia = $(this).html();
          $('.listItem').removeClass('selected'); $(this).addClass('selected');
        });
        // validate
        $(".validateMedia").unbind().click(function(){
          $("#mediaOverlay").fadeOut(fadeTime);
          $(that.mediaDiv).html(selectedMedia);
          that.media = selectedMedia;
        });
      }else{
        //PLAY
      }
    });

  }





  ////////////////////////////////////////////////////////////
  //////////////////////     PROJECT     /////////////////////
  ////////////////////////////////////////////////////////////

  project = new projectObject();
  projectExport = [];
  projectImport = [];

  function projectObject(){

    var that = this;
    that.allScenes = new Array();

  }


  ////////////////////////////////////////////////////////////
  //////////////////////      SCENE      /////////////////////
  ////////////////////////////////////////////////////////////


  $('.sceneEditor').click(function(){
    $('#sceneOverlay').fadeIn(fadeTime);
  });

  function sceneObject(){

    var that = this;
    that.allSequences = new Array();


  }


  ////////////////////////////////////////////////////////////
  //////////////////////    SEQUENCE    //////////////////////
  ////////////////////////////////////////////////////////////

  var editedSequence;

  $('.seqName').click(function(){
    var that = this;
    editedSequence = this;
    var seqName = $(editedSequence).html();
    if(editionMode==true){
      $("#textToEditTitle").html("Nom de la séquence :");
      $("#textOverlay").fadeIn(fadeTime);
      $("#textToEdit").focus();
      $("#textToEdit").val(seqName);
      $('#textToEdit').unbind().keypress(function(e){ if(e.keyCode == 13){ e.preventDefault(); that.validateText(); } });
      $('.validateText').unbind().click(function(){ that.validateText(); });
    }
    // OK
    this.validateText = function(){
      $("#textToEdit").blur();
      $("#textOverlay").fadeOut(fadeTime);
      $(editedSequence).html($("#textToEdit").val());
    }
  });
















});
