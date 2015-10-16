var daysArr = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var monthsArr = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var catList = [];
var $nav = $('#nav');
var $footer = $('#footer');
var initialOffset;
var n;

iframeMessenger.enableAutoResize();

function getFallBackOffset(){

	iframeMessenger.getPositionInformation(function(data) {
		initialOffset = data['iframeTop'];
	});
}
				
function cleanStr(str){
	return str.replace(/ /g,"_").toLowerCase();
}


function initTimeline() {

	//get spreadsheet key from embed url

	var key = getParameter( "key");
	var url = "http://interactive.guim.co.uk/docsdata/" + key + ".json";

	$.getJSON(url, function(data){

		dataset = data.sheets.Sheet1;
		buildTimeline(dataset);

		});

	}

	function buildTimeline(data) {

		n = data.length;
		
		//Make list of categories

		var catListTemp = d3.nest()
				.key(function(d){ return d.category})
				.entries(data);

		catListTemp.forEach(function(d) {	
			catList.push(d.key);
		});	

		//console.log("catList",catList);

		var $menu = $('#category-menu');
		var menuStr = '';
		var selectStr = '<option>select one</option>';
		//var menuStr = '<li class="current">Categories</li>';

		catList.forEach(function(cat,i) {
		
			var catCleaned = cleanStr(cat);

			menuStr += '<li class="category cat'+i+'" data-cat="' +
				catCleaned +
				'"><span>' +
				cat +
				'</span></li>';
				
			selectStr += '<option data-cat="'+catCleaned+'">'+cat+'</option>'

		});

		$menu.html(menuStr).
			parent().append('<select id="dropdown">'+selectStr+'</select>');

		
		var $dropdown = $('#dropdown');
		
		$dropdown.change(function(){

			var catID = $dropdown.find(':selected').data('cat');
			filterBy(catID)

		});
			
			
		// GENERATE LIST, REVERSE ORDER
		
		var timelineStr = '';
		
		for (var i = n-1; i>-1; i--){
		
			var theEvent = data[i];
			var currCat = theEvent['category'];
			var catCleaned = cleanStr(currCat);
			var theDate = theEvent['date'];
			var chunks = theDate.split('/');
			var theDay = chunks[0];
			var theMonth = chunks[1];
			var theYear = chunks[2];
			var jsDateFormat = new Date(theYear+'-'+theMonth+'-'+theDay);
			var theDayofWeek = daysArr[jsDateFormat.getDay()];
			var theMonth = monthsArr[theMonth-1];

			timelineStr += '<li class="' 
				+ catCleaned + ' cat' + catList.indexOf(currCat)
				+ '" id="timeline-entry' 
				+ (i + 1) 
				+ '"><time class="timeline-date" datetime="' 
				+ theDate 
				+ '"><span>' 
				+ theDayofWeek+' '+(theDay*1)+' '+theMonth 
				+ ' <span>'+theYear+'</span></span>' 
				+ '</time>' 
				+ '<div class="timeline-circle" title="'+currCat+'"></div><div class="timeline-entry"><span class="note">' 
				+ data[i]['kicker'] 
				+ '</span><h2 data-incident="timeline-entry' 
				+ (i + 1) + '">' 
				+ data[i]['title'] 
				+ '</h2>'
				+ '<p class="event-type">'+currCat+'</p>'
				+ '<div class="details"><p>' 
				+ data[i]['text'] 
				+ '</p><p class="update">'
				+ '<a class="btn" href="' 
				+ data[i]['link'] 
				+ '" target="_blank">' 
				+ data[i]['source'] 
				+ '</a>'
				+ '</p></div></div>'
				+ '<a class="toggle"></a></li>'

		}

		$('#timeline').addClass('loaded');
		$('#timeline-list').html(timelineStr);
		
		// TOGGLE
		$("a.toggle,h2").click(function(){
		
			$(this).parents('li').toggleClass('open');
		
		});

		var $filters = $(".category");
		var $list = $('#timeline-list li');
		var $reset = $('.reset');
		var $expandAll = $('.expand a');
		
		// TOGGLE ALL EVENTS DESC
		$expandAll.click(function(){
		 
			var state = ($expandAll.text()=='Expand All')? 1:0;
			
			if (state){
				$expandAll.text('Collapse All');
				$list.addClass('open');	
			}
			
			else {
				$expandAll.text('Expand All');
				$list.removeClass('open');	
			}
			
		});
		 
		// RESET ALL EVENTS
		$reset.click(function(){
		 
			$list.removeClass('hidden').removeClass('end');
			$reset.removeClass('on');
			$filters.removeClass('on');
			$dropdown.find('option').eq(0).prop('selected', true);
		 
		});
		
		
		function filterBy(catID){

			$list.addClass('hidden');
			$("#timeline-list ." + catID).removeClass('hidden').last().addClass('end');
			$reset.addClass('on');
			
			if ($nav.position().top > 0){
				
				iframeMessenger.scrollTo(0,initialOffset)
				
			}
		
		}
		
		$filters.click(function(){
		
			var $node = $(this);
			var catID = $node.data('cat');
			
			$filters.removeClass('on').removeClass('end');
			$node.addClass('on');
			
			filterBy(catID);

		});
		

		/*
		$("#expandAll").click(function() {

			if (expanded == True) {
			$(".details").slideDown();
			$("#expandAll").removeClass("glyphicon-plus-sign");
			$("#expandAll").addClass("glyphicon-minus-sign");

			expanded = "yes";
			$("#timeline-list h2").css("background-image", "url(img/up.png)"); 

			}

			else if (expanded == "yes") {
				$(".details").slideUp();
				$("#expandAll").addClass("glyphicon-plus-sign");
				$("#expandAll").removeClass("glyphicon-minus-sign");
				expanded = "no";
				$("#timeline-list h2").css("background-image", "url(img/down.png)"); 

			}

		});
		

		$(".current").click(function(){

			getW = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

			if ($(".category").is(':visible')) {
				$(".category").hide();
			}

			else if ($(".category").is(':hidden')) {
				$(".category").show();
				if (getW > 601) {

				$(".nav-categories li").css("display", "inline-block");
				
				}
			}

		});
		
		*/

		//Sticky nav within iframe

		var initialOffset;

		iframeMessenger.getPositionInformation(function(data) {
			initialOffset = data['iframeTop'];
		});

		if (window!=window.top) { 
		
			setInterval(function(){

				iframeMessenger.getPositionInformation(function(data){
				
						var endPoint = $footer.position().top
						
						//console.log("pageYOffSet", data['pageYOffset'], "iframeTop", data['iframeTop'], "innerHeight", data['innerHeight']);
					
						if (data['iframeTop'] < 0 && data['iframeTop'] > (-1*(endPoint-70))) {

							$nav.animate({top: -1*data['iframeTop'] + 'px'}, 50)

						}

						else if (data['iframeTop'] > 0) {
							$nav.animate({top: 0}, 50)

						}

				});

			}, 100);

		}
		
		/*
		if( !/iPhone|iPad|iPod/i.test(navigator.userAgent) ) {

		$(window).resize(function() {

		getW = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

		if (getW > 601) {

			if ($(".category").is(':hidden')) {
				$(".category").show();
				$(".nav-categories li").css("display", "inline-block");
			}
		 
		}


		if (getW < 600) {

			$(".nav-categories li").css("display", "block");

			if ($(".category").is(':visible')) {
				$(".category").hide();
				
			}

		}

		});


		}
		*/

}


//end initTimeline

function getParameter(paramName) {
  var searchString = window.location.search.substring(1),
	  i, val, params = searchString.split("&");

  for (i=0;i<params.length;i++) {
	val = params[i].split("=");
	if (val[0] == paramName) {
	  return val[1];
	}
  }
  return null;
}


$(window).resize(function(){

	getFallBackOffset();

});

initTimeline();
getFallBackOffset();