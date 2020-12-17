;(function ( $, window, undefined ) {
  var pluginName = 'dragDrop',
	  document = window.document,
	  defaults = {
		  draggableSelector: ".draggable",
		  droppableSelector: ".droppable",
      	  appendToSelector: false
	  };


  function Plugin( element, options ) {
	  this.element = element;
	  this.options = $.extend( {}, defaults, options) ;

	  this._defaults = defaults;
	  this._name = pluginName;

	  this.init();
  }

  Plugin.prototype.init = function () {
	  var droppables = $(this.element).find(this.options.droppableSelector);
	  var draggables = $(this.element).find(this.options.draggableSelector).attr("draggable", "true");
    
    if(this.options.appendToSelector){
      var appendables = $(this.options.appendToSelector);
      
      appendables.on({
        'dragenter': function(ev){
          ev.preventDefault();
          return true;
        },
        'drop': function(ev){
          var data = ev.originalEvent.dataTransfer.getData("Text");
          var draggedEl = document.getElementById(data);
          var destinationEl = $(ev.target);

          destinationEl = destinationEl.closest(appendables.selector).siblings(droppables.selector).append(draggedEl);
          $('.active').removeClass('active');
          $('.over').removeClass('over');
          ev.stopPropagation();
          return false;
        },
        'dragover': function(ev){
          ev.preventDefault();
          $(ev.target).closest(appendables.selector).addClass('over');
          return true;
        },
        'dragleave': function(ev){
          ev.preventDefault();
          $(ev.target).closest(appendables.selector).removeClass('over');
          return true;
        }
      });
    }
    
    droppables.on({
      'mouseup': function(ev){
        $('.active').removeClass('active');
        return true;
      },
      'dragenter': function(ev){
        ev.preventDefault();
        return true;
      },
      'drop': function(ev){
        var data = ev.originalEvent.dataTransfer.getData("Text");
        var draggedEl = document.getElementById(data);
        var destinationEl = $(ev.target);
        
        destinationEl.closest(draggables.selector).before(draggedEl);
        $('.active').removeClass('active');
        $('.over').removeClass('over');
        ev.stopPropagation();
        return false;
      },
      'dragover': function(ev){
        ev.preventDefault();
        $(ev.target).closest(draggables.selector).addClass('over');
        return true;
      },
      'dragleave': function(ev){
        ev.preventDefault();
        $(ev.target).closest(draggables.selector).removeClass('over');
        return true;
      }
    });
    
    
    draggables.on({
      'mousedown': function(ev){
        $(ev.target).closest(draggables.selector).addClass('active');
        return true;
      },
      'mouseup': function(ev){
        $('.active').removeClass('active');
        return true;
      },
      'dragstart': function(ev){
        ev.originalEvent.dataTransfer.effectAllowed='move';
        ev.originalEvent.dataTransfer.setData("Text", ev.target.getAttribute('id'));
        ev.originalEvent.dataTransfer.setDragImage(ev.target,100,20);
        return true;
      },
      'dragend': function(ev){
        return true;
      }
    });
	
  };

  // A really lightweight plugin wrapper around the constructor, 
  // preventing against multiple instantiations
  $.fn[pluginName] = function ( options ) {
	return this.each(function () {
	  if (!$.data(this, 'plugin_' + pluginName)) {
		$.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
	  }
	});
  }

}(jQuery, window));

$(document).ready(function(){
  $("#users").dragDrop({
		  draggableSelector: ".task",
		  droppableSelector: ".task-list",
      appendToSelector: ".user-name"
	});
  $("a.icon-trash").on("click", function(){
    $(this).closest(".task").remove();
  });
  $("a.icon-ok").on("click", function(){
    $(this).closest(".task").appendTo("#completed-tasks");
    $("#completed-tasks").addClass('open');
  });
  $("a.icon-pencil").on("click", function(){
    var task = $(this).closest(".task");
    task.attr("draggable", "false");
    task.find("p").attr("contenteditable", "true").on({
        "keypress": function(ev){
          if(ev.keyCode == 13)
          {
            ev.preventDefault();
            $(this).attr("contenteditable", "false");
            task.attr("draggable", "true");
          }
        },
        "focusout": function(ev){
          $(this).attr("contenteditable", "false");
            task.attr("draggable", "true");
        }
    }).focus();
  });
});