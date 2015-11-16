var daysArr = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var monthsArr = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var cleanData = [];
var catList = [];
var catListCount = [];
var $nav = $('#nav');
var $count = $('#count span');
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
		settings = data.sheets.Sheet2;
		buildTimeline(dataset,settings);

	});

}

	function buildTimeline(data) {

		n = data.length;
	
		//Make list of categories

		var $menu = $('#category-menu');
		var menuStr = '<li class="filter">Filter by</li>';
		
		// GET CATEGORIES
		
		$.each(data, function(i,val) {

		  	var category = val['category'];
		  	
		  	if (category!=''){
		  	
				var index = catList.indexOf(category);
			
				if (index < 0){
					catList.push(category);
					catListCount.push(1);
				}
				else {
					catListCount[index]++;
				}
				
				cleanData.push(val);
			}
			
		});

		$.each(catList, function(i,val) {
		
			var catCleaned = cleanStr(val);
			var n = catListCount[i];

			menuStr += '<li class="category cat'+i+'" data-cat="' +
				catCleaned +
				'" data-count="'+n+'"><span>' +
				val +
				' <em>('+n+')</em></span></li>';

		});

		$menu.html(menuStr)
		
		$('.filter').click(function(){
		
			var w = $(document).width();
			var $node = $(this);
			
			if (w<681){
				
				$node.parent().toggleClass('open');
			
			}
		
		});
		
			
		// GENERATE LIST
		
		var timelineStr = '';
		
		for (var i = 0; i<n; i++){

			var theEvent = cleanData[i];
			var currCat = theEvent['category'];
			var catCleaned = cleanStr(currCat);

			var dateTimeString = moment(theEvent['date'] + theEvent['time'], "D-MMMM-YYYY HH:MM");		

			timelineStr += '<li class="' 
				+ catCleaned + ' cat' + catList.indexOf(currCat)
				+ '" id="timeline-entry' 
				+ (i + 1) 
				+ '"><time class="timeline-date" datetime="' 
				+ dateTimeString
				+ '"><span>' 
				+ theEvent['date']
				+ ' <span>'+theEvent['time']+'</span></span>' 
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
		$count.html(n);
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
			$count.html(n);
		 
		});
		
		
		function filterBy(catID){

			$list.addClass('hidden');
			$("#timeline-list ." + catID).removeClass('hidden').last().addClass('end');
			$reset.addClass('on');
			$menu.removeClass('open');
			
			if ($nav.position().top > 0){
				
				iframeMessenger.scrollTo(0,initialOffset)
				
			}
		
		}
		
		$filters.click(function(){
		
			var $node = $(this);
			var catID = $node.data('cat');
			var n = $node.data('count');
			
			$filters.removeClass('on').removeClass('end');
			$node.addClass('on');
			$count.html(n);
			filterBy(catID);

		});
		

		//Sticky nav within iframe

		if (window!=window.top) { 
		
			setInterval(function(){

				iframeMessenger.getPositionInformation(function(data){
				
						var endPoint = $footer.position().top
						
						//console.log("pageYOffSet", data['pageYOffset'], "iframeTop", data['iframeTop'], "innerHeight", data['innerHeight']);
					
						if (data['iframeTop'] < 0 && data['iframeTop'] > (-1*(endPoint-70))) {

							$nav.css({top: -1*data['iframeTop'] + 'px'})

						}

						else if (data['iframeTop'] > 0) {
							$nav.css({top: 0})

						}

				});

			}, 100);

		}

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