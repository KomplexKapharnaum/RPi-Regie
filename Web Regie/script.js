
$(function() {

  ////////////////////////////////////////////////////////////
  /////////////////////////  TOGGLES  ////////////////////////
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
      $('.seqControls').fadeOut(fadeTime,function(){
        editionMode=false;
      });
    }
    if(editionMode==false){
      $('.editToggle').removeClass('btnOff').addClass('btnOn');
      $('.seqControls').fadeIn(fadeTime,function(){
        editionMode=true;
      });
    }
  });

  $('.folderEditor').click(function(){
    $('#folderOverlay').fadeIn(fadeTime);
  });





  $('.addDispo').click(function(){
    pool.addDispo();
  });

  ////////////////////////////////////////////////////////////
  /////////////////////////    POOL   ////////////////////////
  ////////////////////////////////////////////////////////////

  pool = new poolObject();

  function poolObject(){

    allDispos = new Array();

    this.addDispo = function(){
        allDispos.push(new dispoObject());
    }

  }




  ////////////////////////////////////////////////////////////
  /////////////////////////   DISPO   ////////////////////////
  ////////////////////////////////////////////////////////////

  function dispoObject(){

    var that = this;
    // divs
    this.dispoHeader = $('<th><div class="dispo"></div></th>').insertBefore('#addRemoveDispos');
    // naming
    this.dispoNaming =$('<div class="dispoNaming"></div>').appendTo(this.dispoHeader.children());
    this.operatorEditor = $('<div class="operatorEditor">operator name</div>').appendTo(this.dispoNaming);
    this.name = $('<div class="nameEditor">dispo name</div>').appendTo(this.dispoNaming);
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



    // init
    this.updateConnectionState();



  }

  ////////////////////////////////////////////////////////////
  /////////////////////////   CASE    ////////////////////////
  ////////////////////////////////////////////////////////////

  function boxObject(div){

    this.box = $('<td class="box"><div class="mediaSelector">...</div></td>').appendTo($(div).parent());

    this.updateConnectionState = function(state){
      if(state=='disconnected'){
        this.box.css({opacity:0.4});
      }
      if(state=='connected'){
        this.box.css({opacity:1});
      }
    }

  }













});
