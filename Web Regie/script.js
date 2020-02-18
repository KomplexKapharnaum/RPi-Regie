
$(function() {



    ////////////////////////////////////////////////////////////
    /////////////////////////  TOGGLES /////////////////////////
    ////////////////////////////////////////////////////////////

    var editionMode = true;
    var expandedMode = true;
    var fadeTime = 200;

    $('.dispoToggle').click(function(){
      $('.dispoMore').slideToggle(200);
    });

    $('.editToggle').click(function(){
      if(expandedMode==true){
        $('.seqControls').fadeOut(fadeTime,function(){
          expandedMode=false;
        });
      }
      if(expandedMode==false){
        $('.seqControls').fadeIn(fadeTime,function(){
          expandedMode=true;
        });
      }
    });

    $('.folderEditor').click(function(){
      $('#folderOverlay').fadeIn(fadeTime);
    });

});
