(function(){
  var app = angular.module('awesomeCalendar', [ ]);
  var validFrom = new Date(2014, 2, 2),
      validTo = new Date(),
      validToId,
      validFromId;
  //datepicker range
  var year = new Date(Date.now()).getFullYear()-1;
  var startYear = new Date(Date.now()).getFullYear()-1;
  var endYear = new Date(Date.now()).getFullYear();
  
  app.controller('DrawDatepicker', function(){
    this.years = calendar;
    this.firstDate = true;
    this.all_dates = days_index;
    this.select = function(item) {
      if (!days_index[item.index].invalid) {
        if (this.firstDate) {
          this.from = {
            year: item.year,
            month: item.month,
            date: item.date,
            index: item.index,
            string: formatdate(new Date(item.year, item.month, item.date))
          };

          //clearing selected
          var days_index_length = days_index.length;
          for (i = 0; i < days_index_length; i++) {days_index[i].selected=false;}
          //select startdate
          days_index[item.index].selected = true;
          //make dates earlier firstdate invalid
          var len = this.from.index;
          for (i = 0; i < len; i++) {days_index[i].invalid = true;}
          
          //clearing to
          this.to = {};

          $('.from').val(this.from.string);
        }
        else {
          this.to = {
            year: item.year,
            month: item.month,
            date: item.date,
            index: item.index,
            string: formatdate(new Date(item.year, item.month, item.date))
          };

          //selecting dates
          var i = this.from.index;
          var len = item.index;
          for (i; i <= len; i++) {days_index[i].selected = true;}
          //return initial invalid
          for (i = validFromId; i <= validToId; i++) {days_index[i].invalid = false;}
        }
        this.firstDate = !this.firstDate;
        $('.to').val(this.to.string);
      }
    };
    
    this.clearCalendar = function() {
      //return initial invalid
      for (i = validFromId; i <= validToId; i++) {days_index[i].invalid = false;}
      this.to = {};
      this.from = {};
      //clearing selected
      var days_index_length = days_index.length;
      for (i = 0; i < days_index_length; i++) {days_index[i].selected = false;}
      this.firstDate = true;
    }
    
    this.setDate = function(item, isFirst) {
      this.firstDate = isFirst;
      if (typeof item != 'undefined' && item != '__.__.____' && item != '') {
        var date = parsedate(item).date;
        if (!isFirst && date < parsedate(this.from.string).date) {
          date = parsedate(this.from.string).date;
          $('.to').val(this.from.string);
        }
        else if (!isFirst && date > validTo) {
          date = validTo;
          $('.to').val(formatdate(validTo));
        }
        else if (isFirst && date < validFrom) {
          date = validFrom;
          $('.from').val(formatdate(validFrom));
        }
        var year = date.getFullYear();
        var month = date.getMonth();
        var day = date.getDate();
        this.select({
          year: year,
          month: month,
          date: day,
          index: dateselector(date).data('index')
        });
      }
      else {
        if (isFirst) {this.clearCalendar();}
        else {
          $('.from').trigger('blur');
        }
      }
    };
    this.daynames = datenames.days;
  });
  
  //filters
  app.filter('M', function() {
    return function(string) {
      return datenames.months[Number(string)];
    };
  });
  
  app.filter('to01', function() {
    return function(string) {
      if (Number(string) < 10) {return '0' + string}
      else {return string}
    };
  });
  
  var datenames = {
    months : ['Январь','Февраль','Март','Апрель','Май','Июнь',
              'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    days : ['пн','вт','ср','чт','пт','сб','вс']
  };
  
  
  //fill calendar
  var calendar = [],
      days = [],
      days_index = [],
      days_index_i = 0;
  for (year; year <= endYear; year++) {
    var index = year-endYear+1;
    for (month = 0; month < 12; month++) { 
      //month
      calendar.push({month: month, year: year, weeks: []});
      var firstDay = new Date(year, month, 1).getDate();
      var lastDay = new Date(year, month + 1, 0).getDate();
      for (date = 1; date <= lastDay; date++) { 
        var invalid = true;
        
        //week-days
        var day = new Date(year, month, date).getDay();
        if (day == 1 || date == 1) {days = [];}
        // if new month - fill empty cells
        if (date == 1) {
          var week = 0; 
          var len = day-1;
          if (day == 0) {len = 6;}
          for (i = 0; i < len; i++) {
            days.push({date: '', empty: true});
          }
        }
        
        //if isinvalid
        if (new Date(year, month, date) >= validFrom && new Date(year, month, date) <= validTo) {invalid = false;}
        if (new Date(year, month, date).toDateString() == validFrom.toDateString()) {validFromId = days_index_i;}
        if (new Date(year, month, date).toDateString() == validTo.toDateString()) {validToId = days_index_i;}
        
        days.push({date: date, month: month, year: year, index: days_index_i});
        
        // fill empty cells after month
        if (date == lastDay && day > 0) {
//          for (i = day; i < 7; i++) {
//            days.push({date: '', empty: true});
//          }
          calendar[month+(index*12)].weeks.push({days: days});
          week = 0;
        }
        
        //push days into week
        if (day == 0) {calendar[month+(index*12)].weeks.push({days: days});week++;}
        
        days_index.push({invalid: invalid, selected: false});
        days_index_i++;
      }
    }
  }
  
  $(document).ready(function(){
    $(".from, .to").inputmask("d.m.y");
    scrollInit();
    
    ///**** slider
    $( "#date-slider" ).slider({ 
      value: 0, 
      min: 0, 
      max: days_index.length, 
      slide: function (event, ui) {
        var width = $('.calendar').prop('scrollWidth');
        var left = (width/days_index.length)*ui.value;
        $('.calendar').scrollLeft(left);
      },
      animate: 200
    });
    
    $.event.props.push("wheelDelta");
    $( '.calendar' ).on( 'mousewheel DOMMouseScroll', function (e){
      var delta = e.wheelDelta || -e.detail;
      this.scrollLeft += ( delta < 0 ? 1 : -1 ) * 50;
      var left = $(this).scrollLeft();
      var width = $('.calendar').prop('scrollWidth');
      var value = days_index.length * left / width;
      $( "#date-slider" ).slider('value',value);
      //e.preventDefault();
    });
    
    $('.arrow').click(function(){
      var left = $('.calendar').scrollLeft();
      var month = $('.month').width();
      if ($(this).is('[class*="left"]')) {month *= -1;}
      console.log(typeof left, typeof month);
      left += month;
      $('.calendar').animate({scrollLeft: left}, 200, 'easeOutCubic');
      var width = $('.calendar').prop('scrollWidth');
      var value = days_index.length * left / width;
      $( "#date-slider" ).slider('value',value);
    });
  });

  function scrollInit() {
    var totalWidth = $('.datepicker-outer').width();
    var yearWidth = (totalWidth / calendar.length) * 100 / (totalWidth*12);
    var yearWidth = yearWidth + '%';
    $('.scroll-years').width(yearWidth);
    var monthWidth = (totalWidth / calendar.length) * 100 / totalWidth;
    var monthWidth = monthWidth + '%';
    $('.scroll-months').width(monthWidth);
    $('.scroll-months').each(function(){
      var totalDays = $(this).find('.scroll-days:not(.empty)').length;      
      $(this).children().each(function(){
        var weekWidth = $(this).find('.scroll-days:not(.empty)').length * 100 / totalDays;
        $(this).width(weekWidth + '%');
        $(this).find('.scroll-days:not(.empty)').width((100/($(this).find('.scroll-days:not(.empty)').length)) + '%');
      });
    });
  }
  
})();

function parsedate(date) {
  var year = date.replace(/(\d{2}.){2}/g, '');
  var month = date.replace(/(^\d{2}.)(\d+)(.\d+$)/g, '$2');
  var day = date.replace(/(.\d{2}.\d+$)/g, '');
  var date = new Date(year, month-1, day);
  return {date: date, year: year, month: month, day: day};
}

function formatdate(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  if (month < 10) {month = '0' + month}
  if (day < 10) {day = '0' + day}
  var date = day + '.' + month + '.' + year;
  return date;
}

function dateselector(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  if (month < 10) {month = '0' + month}
  if (day < 10) {day = '0' + day}
  return $('[data-year="' + year + '"][data-month="' + month + '"][data-date="' + day + '"]');
}







































  
  
  
  
  
  
  
  