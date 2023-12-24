!function() {

  var today = moment();
//IDIOT ABSTRACTING: the function grabs all the parts and makes the calendar
  function Calendar(selector, events) {
    this.el = document.querySelector(selector);
    this.events = events;
    this.current = moment().date(1);
    this.events.forEach(function(ev) {
     ev.date = moment(ev.date);
    });
    this.draw();
    var current = document.querySelector('.today');
    if(current) {
      var self = this;
      window.setTimeout(function() {
        self.openDay(current);
      }, 500);
    }
    //if current month has 6 rows, somehow push the legend down a row aswell.
    this.spaceToFit();
  }

  Calendar.prototype.draw = function() {
    //Create Header
    this.drawHeader();

    //Draw Month
    this.drawMonth();

    this.drawLegend();
  }

  Calendar.prototype.drawHeader = function() {
    var self = this;
    if(!this.header) {
      //Create the header elements
      this.header = createElement('div', 'header');
      this.header.className = 'header';

      this.title = createElement('h1');

      var right = createElement('div', 'right');
      right.addEventListener('click', function() { self.nextMonth(); });

      var left = createElement('div', 'left');
      left.addEventListener('click', function() { self.prevMonth(); });

      //Append the Elements
      this.header.appendChild(this.title); 
      this.header.appendChild(right);
      this.header.appendChild(left);
      this.el.appendChild(this.header);
    }

    this.title.innerHTML = this.current.format('MMMM YYYY');
  }

  Calendar.prototype.drawMonth = function() {
    var self = this;
    
    
    if(this.month) {
      this.oldMonth = this.month;
      this.oldMonth.className = 'month out ' + (self.next ? 'next' : 'prev');
      this.oldMonth.addEventListener('webkitAnimationEnd', function() {
        self.oldMonth.parentNode.removeChild(self.oldMonth);
    //new month element
        self.month = createElement('div', 'month');
        self.backFill();
        self.currentMonth();
        self.fowardFill();
        //if i need to fit more shit; increase #calendar height!
        self.spaceToFit();
        
    //append new month element
        self.el.appendChild(self.month);
        window.setTimeout(function() {
          self.month.className = 'month in ' + (self.next ? 'next' : 'prev');
        }, 16);
      });
    } else {
        this.month = createElement('div', 'month');
        this.el.appendChild(this.month);
        this.backFill();
        this.currentMonth();
        this.fowardFill();
        this.month.className = 'month new';
    }
  }

  Calendar.prototype.backFill = function() {
    var clone = this.current.clone();
    var dayOfWeek = clone.day();

    if(!dayOfWeek) { return; }

    clone.subtract('days', dayOfWeek+1);

    for(var i = dayOfWeek; i > 0 ; i--) {
      this.drawDay(clone.add('days', 1));
    }
  }

  Calendar.prototype.fowardFill = function() {
    var clone = this.current.clone().add('months', 1).subtract('days', 1);
    var dayOfWeek = clone.day();

    if(dayOfWeek === 6) { return; }

    for(var i = dayOfWeek; i < 6 ; i++) {
      this.drawDay(clone.add('days', 1));
    }
  }
 
  Calendar.prototype.spaceToFit = function() {
    if(this.countWeeksInMonth() === 5) {
      
    var fiveRows = document.getElementById("calendar");
    fiveRows.style.height ="64.0em";
    }
    else {var sixRows = document.getElementById("calendar");
    sixRows.style.height ="72.0em";} 
  };

  Calendar.prototype.openFirstDay = function() {
    var firstDayElement = document.querySelector('.day');
    if (firstDayElement) {
      this.openDay(firstDayElement);
    }
  };

  Calendar.prototype.currentMonth = function() {
    var clone = this.current.clone();

    while(clone.month() === this.current.month()) {
      this.drawDay(clone);
      clone.add('days', 1);
    }
  }

  Calendar.prototype.getWeek = function(day) {
    if(!this.week || day.day() === 0) {
      this.week = createElement('div', 'week');
      this.month.appendChild(this.week);
    }
  }
// IDIOT ABSTRACTING: this makes each day square of the calendar
  Calendar.prototype.drawDay = function(day) {
    var self = this;
    this.getWeek(day);

    //Outer Day
    var outer = createElement('div', this.getDayClass(day));
    outer.addEventListener('click', function() {
      self.openDay(this);
    });

    //Day Name
    var name = createElement('div', 'day-name', day.format('ddd'));

    //Day Number
    var number = createElement('div', 'day-number', day.format('DD'));


    //Events
    var events = createElement('div', 'day-events');
    this.drawEvents(day, events);
//so the method runs through all available events for every single day of the current month?
    outer.appendChild(name);
    outer.appendChild(number);
    outer.appendChild(events);
    this.week.appendChild(outer);
  }

  Calendar.prototype.countWeeksInMonth = function() {
    // Get the first day of the month
    var firstDayOfMonth = this.current.clone().startOf('month');

    // Get the last day of the month
    var lastDayOfMonth = this.current.clone().endOf('month');

    // Count the number of weeks between the first and last day of the month
    var weeksInMonth = lastDayOfMonth.week() - firstDayOfMonth.week() + 1;

    // Adjust for cases where the last week may spill into the next month
    if (weeksInMonth < 0) {
        weeksInMonth = 52 - firstDayOfMonth.week() + lastDayOfMonth.week() + 1;
    }

    return weeksInMonth;
  }
  
//IDIOT ABSTRACTION: use method-filter day events- prettys text with SPAN!
  Calendar.prototype.drawEvents = function(day, element) {
    if(day.month() === this.current.month()) {
      var todaysEvents = this.events.reduce(function(memo, ev) {
        if(ev.date.isSame(day, 'day')) {
          memo.push(ev);
        }
        return memo;
      }, []);

      todaysEvents.forEach(function(ev) {
        var evSpan = createElement('span', ev.color);
        element.appendChild(evSpan);
      });
    }
  }

  Calendar.prototype.getDayClass = function(day) {
    classes = ['day'];
    if(day.month() !== this.current.month()) {
      classes.push('other');
    } else if (today.isSame(day, 'day')) {
      classes.push('today');
    }
    return classes.join(' ');
  }

  Calendar.prototype.openDay = function(el) {
    var details, arrow;
    var dayNumber = +el.querySelectorAll('.day-number')[0].innerText || +el.querySelectorAll('.day-number')[0].textContent;
    var day = this.current.clone().date(dayNumber);

    var currentOpened = document.querySelector('.details');

    //Check to see if there is an open detais box on the current row
    if(currentOpened && currentOpened.parentNode === el.parentNode) {
      details = currentOpened;
      arrow = document.querySelector('.arrow');
    } else {
      //Close the open events on differnt week row
      //currentOpened && currentOpened.parentNode.removeChild(currentOpened);
      if(currentOpened) {
        currentOpened.addEventListener('webkitAnimationEnd', function() {
          currentOpened.parentNode.removeChild(currentOpened);
        });
        currentOpened.addEventListener('oanimationend', function() {
          currentOpened.parentNode.removeChild(currentOpened);
        });
        currentOpened.addEventListener('msAnimationEnd', function() {
          currentOpened.parentNode.removeChild(currentOpened);
        });
        currentOpened.addEventListener('animationend', function() {
          currentOpened.parentNode.removeChild(currentOpened);
        });
        currentOpened.className = 'details out';
      }

      //Create the Details Container
      details = createElement('div', 'details in');

      //Create the arrow
      var arrow = createElement('div', 'arrow');

      //Create the event wrapper

      details.appendChild(arrow);
      el.parentNode.appendChild(details);
    }
//IDIOT ABSTRACTION:  filters day's events, calls a method named renderEvents = probs display text on website
    var todaysEvents = this.events.reduce(function(memo, ev) {
      if(ev.date.isSame(day, 'day')) {
        memo.push(ev);
      }
      return memo;
    }, []);
//IDIOT ABSTRACTION: details the event's HTML container of event information
    this.renderEvents(todaysEvents, details);

    arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px';
  }

  Calendar.prototype.renderEvents = function(events, ele) {
    //Remove any events in the current details element
    var currentWrapper = ele.querySelector('.events');
    var wrapper = createElement('div', 'events in' + (currentWrapper ? ' new' : ''));

    events.forEach(function(ev) {
      var div = createElement('div', 'event');
      var square = createElement('div', 'event-category ' + ev.color);
      var span = createElement('span', '', ev.eventName);
      var duration = createElement('span', '', `(${ev.duration})`);
      if(ev.blogLink){
        var anchor = createElement('a', '','[More Info]');
        anchor.href = ev.blogLink;
      };
      

      div.appendChild(square);
      div.appendChild(span);
      div.appendChild(duration);
      if(ev.blogLink) {
        div.appendChild(anchor);
      };
      wrapper.appendChild(div);
    });

    if(!events.length) {
      var div = createElement('div', 'event empty');
      var span = createElement('span', '', 'No Events');

      div.appendChild(span);
      wrapper.appendChild(div);
    }

    if(currentWrapper) {
      currentWrapper.className = 'events out';
      currentWrapper.addEventListener('webkitAnimationEnd', function() {
        currentWrapper.parentNode.removeChild(currentWrapper);
        ele.appendChild(wrapper);
      });
      currentWrapper.addEventListener('oanimationend', function() {
        currentWrapper.parentNode.removeChild(currentWrapper);
        ele.appendChild(wrapper);
      });
      currentWrapper.addEventListener('msAnimationEnd', function() {
        currentWrapper.parentNode.removeChild(currentWrapper);
        ele.appendChild(wrapper);
      });
      currentWrapper.addEventListener('animationend', function() {
        currentWrapper.parentNode.removeChild(currentWrapper);
        ele.appendChild(wrapper);
      });
    } else {
      ele.appendChild(wrapper);
    }
  }

  Calendar.prototype.drawLegend = function() {
    var legend = createElement('div', 'legend');
    var calendars = this.events.map(function(e) {
      return e.calendar + '|' + e.color;
    }).reduce(function(memo, e) {
      if(memo.indexOf(e) === -1) {
        memo.push(e);
      }
      return memo;
    }, []).forEach(function(e) {
      var parts = e.split('|');
      var entry = createElement('span', 'entry ' +  parts[1], parts[0]);
      legend.appendChild(entry);
    });
    this.el.appendChild(legend);
  }

  Calendar.prototype.nextMonth = function() {
    this.current.add('months', 1);
    this.next = true;
    this.draw();  
  }

  Calendar.prototype.prevMonth = function() {
    this.current.subtract('months', 1);
    this.next = false;
    this.draw();
  }

  window.Calendar = Calendar;

  function createElement(tagName, className, innerText) {
    var ele = document.createElement(tagName);
    if(className) {
      ele.className = className;
    }
    if(innerText) {
      ele.innderText = ele.textContent = innerText;
    }
    return ele;
  }
}();
//not normalised but ok ig?
!function() {
  var data = [
    { eventName: 'Crooked brook Sunflowers', calendar: 'Sunflowers', color: 'yellow', duration:'January', date: '2024-01-12', blogLink: '/blogPages/sunflower.html' },
    { eventName: 'Crooked brook Sunflowers', calendar: 'Sunflowers', color: 'yellow', duration:'January', date: '2024-01-13', blogLink: '/blogPages/sunflower.html' },
    { eventName: 'Crooked brook Sunflowers', calendar: 'Sunflowers', color: 'yellow', duration:'January', date: '2024-01-14', blogLink: '/blogPages/sunflower.html' },
    { eventName: 'Crooked brook Sunflowers', calendar: 'Sunflowers', color: 'yellow', duration:'January', date: '2024-01-19', blogLink: '/blogPages/sunflower.html' },
    { eventName: 'Crooked brook Sunflowers', calendar: 'Sunflowers', color: 'yellow', duration:'January', date: '2024-01-20', blogLink: '/blogPages/sunflower.html' },
    { eventName: 'Crooked brook Sunflowers', calendar: 'Sunflowers', color: 'yellow', duration:'January', date: '2024-01-21', blogLink: '/blogPages/sunflower.html' },

    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-08-16', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-08-17', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-08-18', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-08-19', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-08-20', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-08-21', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-08-22', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-08-23', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-08-24', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-08-25', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-08-26', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-08-27', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-08-28', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-08-29', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-08-30', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-01', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-02', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-03', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-04', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-05', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-06', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-07', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-08', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-09', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-10', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-11', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-12', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-13', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-14', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-15', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-16', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-17', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-18', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-19', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-20', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-21', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-22', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-23', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-24', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-25', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-26', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-27', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-28', blogLink: '/blogPages/tulips.html' },
    {eventName: 'Springtime Tulip Festival', calendar: 'Tulips', color: 'teal', duration:'mid-august - september', date: '2024-09-29', blogLink: '/blogPages/tulips.html' },

    
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-10-22', blogLink: '/blogPages/jacaranda.html' },
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-10-23', blogLink: '/blogPages/jacaranda.html' },
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-10-24', blogLink: '/blogPages/jacaranda.html' },
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-10-25', blogLink: '/blogPages/jacaranda.html' },
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-10-26', blogLink: '/blogPages/jacaranda.html' },
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-10-27', blogLink: '/blogPages/jacaranda.html' },
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-10-28', blogLink: '/blogPages/jacaranda.html' },
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-11-01', blogLink: '/blogPages/jacaranda.html' },
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-11-02', blogLink: '/blogPages/jacaranda.html' },
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-11-03', blogLink: '/blogPages/jacaranda.html' },
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-11-04', blogLink: '/blogPages/jacaranda.html' },
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-11-05', blogLink: '/blogPages/jacaranda.html' },
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-11-06', blogLink: '/blogPages/jacaranda.html' },
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-11-07', blogLink: '/blogPages/jacaranda.html' },
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-11-21', blogLink: '/blogPages/jacaranda.html' },
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-11-22', blogLink: '/blogPages/jacaranda.html' },
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-11-23', blogLink: '/blogPages/jacaranda.html' },
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-11-24', blogLink: '/blogPages/jacaranda.html' },
    { eventName: 'Jacaranda Bloom', calendar: 'Jacaranda', color: 'purple', duration:'mid-October - mid-November' , date: '2024-11-25', blogLink: '/blogPages/jacaranda.html' },
    
    {eventName: 'Canola Fields', calendar: 'Canola', color: 'yellow', duration:'weekends starting the 3rd week of august and lasts for around 6 weeks' , date: '2024-08-17', blogLink: '/blogPages/canola.html' },
    {eventName: 'Canola Fields', calendar: 'Canola', color: 'yellow', duration:'weekends starting the 3rd week of august and lasts for around 6 weeks' , date: '2024-08-18', blogLink: '/blogPages/canola.html' },
    {eventName: 'Canola Fields', calendar: 'Canola', color: 'yellow', duration:'weekends starting the 3rd week of august and lasts for around 6 weeks' , date: '2024-08-24', blogLink: '/blogPages/canola.html' },
    {eventName: 'Canola Fields', calendar: 'Canola', color: 'yellow', duration:'weekends starting the 3rd week of august and lasts for around 6 weeks' , date: '2024-08-25', blogLink: '/blogPages/canola.html' },
    {eventName: 'Canola Fields', calendar: 'Canola', color: 'yellow', duration:'weekends starting the 3rd week of august and lasts for around 6 weeks' , date: '2024-08-31', blogLink: '/blogPages/canola.html' },
    {eventName: 'Canola Fields', calendar: 'Canola', color: 'yellow', duration:'weekends starting the 3rd week of august and lasts for around 6 weeks' , date: '2024-09-01', blogLink: '/blogPages/canola.html' },
    {eventName: 'Canola Fields', calendar: 'Canola', color: 'yellow', duration:'weekends starting the 3rd week of august and lasts for around 6 weeks' , date: '2024-09-07', blogLink: '/blogPages/canola.html' },
    {eventName: 'Canola Fields', calendar: 'Canola', color: 'yellow', duration:'weekends starting the 3rd week of august and lasts for around 6 weeks' , date: '2024-09-08', blogLink: '/blogPages/canola.html' },
    {eventName: 'Canola Fields', calendar: 'Canola', color: 'yellow', duration:'weekends starting the 3rd week of august and lasts for around 6 weeks' , date: '2024-08-31', blogLink: '/blogPages/canola.html' },
    {eventName: 'Canola Fields', calendar: 'Canola', color: 'yellow', duration:'weekends starting the 3rd week of august and lasts for around 6 weeks' , date: '2024-09-01', blogLink: '/blogPages/canola.html' },
    {eventName: 'Canola Fields', calendar: 'Canola', color: 'yellow', duration:'weekends starting the 3rd week of august and lasts for around 6 weeks' , date: '2024-09-07', blogLink: '/blogPages/canola.html' },
    {eventName: 'Canola Fields', calendar: 'Canola', color: 'yellow', duration:'weekends starting the 3rd week of august and lasts for around 6 weeks' , date: '2024-09-08', blogLink: '/blogPages/canola.html' },

    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-04-24', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-04-25', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-04-26', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-04-27', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-04-28', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-04-29', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-04-30', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-04-31', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-01', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-02', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-03', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-04', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-05', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-06', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-07', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-08', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-09', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-10', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-11', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-12', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-13', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-14', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-15', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-16', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-17', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-18', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-19', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-20', blogLink: '/blogPages/AutumnTrees.html' },
    {eventName: 'Araluen Autumn Trees', calendar: 'Autumn Trees', color: 'orange', duration:'April - May', date: '2024-05-21', blogLink: '/blogPages/AutumnTrees.html' },
    
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-10-15', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-10-16', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-10-17', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-10-18', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-10-19', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-10-20', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-10-21', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-10-22', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-10-23', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-10-24', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-10-25', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-10-26', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-10-27', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-10-28', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-10-29', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-10-30', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-11-01', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-11-02', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-11-03', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-11-04', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-11-05', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-11-06', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-11-07', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-11-08', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-11-09', blogLink: '/blogPages/araluanRose.html' },
    {eventName: 'Araluen Rose Garden', calendar: 'Araluen Rose', color: 'red', duration:'best time: Late-October - Early-November', date: '2024-11-10', blogLink: '/blogPages/araluanRose.html' },
    
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-03-03', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-03-10', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-03-17', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-03-24', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-03-31', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-04-07', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-04-14', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-04-21', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-04-28', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-05-05', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-05-12', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-05-19', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-05-26', blogLink: '/blogPages/duracksRose.html' },
  
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-10-06', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-10-13', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-10-20', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-10-27', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-11-03', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-11-10', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-11-17', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-11-24', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-12-01', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-12-08', blogLink: '/blogPages/duracksRose.html' },
    { eventName: 'Patsy Duracks Rose garden', calendar: 'Duracks Rose', color: 'pink', duration: 'March-May and October-December', date: '2024-12-15', blogLink: '/blogPages/duracksRose.html' },

    { eventName: 'S&R Autumn Festival', calendar: 'S&R Autumn', color: 'rust', duration: 'End of May', date: '2024-05-27', blogLink: '/blogPages/snrautumn.html' },
    { eventName: 'S&R Autumn Festival', calendar: 'S&R Autumn', color: 'rust', duration: 'End of May', date: '2024-05-28', blogLink: '/blogPages/snrautumn.html' },
    { eventName: 'S&R Autumn Festival', calendar: 'S&R Autumn', color: 'rust', duration: 'End of May', date: '2024-05-29', blogLink: '/blogPages/snrautumn.html' },
    { eventName: 'S&R Autumn Festival', calendar: 'S&R Autumn', color: 'rust', duration: 'End of May', date: '2024-05-30', blogLink: '/blogPages/snrautumn.html' },
    { eventName: 'S&R Autumn Festival', calendar: 'S&R Autumn', color: 'rust', duration: 'End of May', date: '2024-05-31', blogLink: '/blogPages/snrautumn.html' },
    { eventName: 'S&R Autumn Festival', calendar: 'S&R Autumn', color: 'rust', duration: 'End of May', date: '2024-06-01', blogLink: '/blogPages/snrautumn.html' },
    { eventName: 'S&R Autumn Festival', calendar: 'S&R Autumn', color: 'rust', duration: 'End of May', date: '2024-06-02', blogLink: '/blogPages/snrautumn.html' },

    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-01', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-02', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-03', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-04', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-05', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-06', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-07', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-08', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-09', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-10', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-11', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-12', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-13', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-14', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-15', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-16', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-17', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-18', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-19', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-20', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-21', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-22', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-23', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-26', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-27', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-28', blogLink: '/blogPages/snrblossom.html' },
    {eventName: 'S&R Blossom Festival', calendar: 'S&R Blossom', color: 'coral', duration:'September', date: '2024-09-29', blogLink: '/blogPages/snrblossom.html' },

    {eventName: 'Everlasting Kings Park Festival', calendar: 'Kings Park Everlastings', color: 'green', duration:'September', date: '2024-09-13', blogLink: '/blogPages/everlastings.html' },
    {eventName: 'Everlasting Kings Park Festival', calendar: 'Kings Park Everlastings', color: 'green', duration:'September', date: '2024-09-14', blogLink: '/blogPages/everlastings.html' },
    {eventName: 'Everlasting Kings Park Festival', calendar: 'Kings Park Everlastings', color: 'green', duration:'September', date: '2024-09-15', blogLink: '/blogPages/everlastings.html' },
    {eventName: 'Everlasting Kings Park Festival', calendar: 'Kings Park Everlastings', color: 'green', duration:'September', date: '2024-09-16', blogLink: '/blogPages/everlastings.html' },
    {eventName: 'Everlasting Kings Park Festival', calendar: 'Kings Park Everlastings', color: 'green', duration:'September', date: '2024-09-17', blogLink: '/blogPages/everlastings.html' },
    {eventName: 'Everlasting Kings Park Festival', calendar: 'Kings Park Everlastings', color: 'green', duration:'September', date: '2024-09-18', blogLink: '/blogPages/everlastings.html' },
    {eventName: 'Everlasting Kings Park Festival', calendar: 'Kings Park Everlastings', color: 'green', duration:'September', date: '2024-09-19', blogLink: '/blogPages/everlastings.html' },
    {eventName: 'Everlasting Kings Park Festival', calendar: 'Kings Park Everlastings', color: 'green', duration:'September', date: '2024-09-20', blogLink: '/blogPages/everlastings.html' },
    {eventName: 'Everlasting Kings Park Festival', calendar: 'Kings Park Everlastings', color: 'green', duration:'September', date: '2024-09-21', blogLink: '/blogPages/everlastings.html' },
    {eventName: 'Everlasting Kings Park Festival', calendar: 'Kings Park Everlastings', color: 'green', duration:'September', date: '2024-09-22', blogLink: '/blogPages/everlastings.html' },
    {eventName: 'Everlasting Kings Park Festival', calendar: 'Kings Park Everlastings', color: 'green', duration:'September', date: '2024-09-23', blogLink: '/blogPages/everlastings.html' },
    {eventName: 'Everlasting Kings Park Festival', calendar: 'Kings Park Everlastings', color: 'green', duration:'September', date: '2024-09-24', blogLink: '/blogPages/everlastings.html' },
    {eventName: 'Everlasting Kings Park Festival', calendar: 'Kings Park Everlastings', color: 'green', duration:'September', date: '2024-09-25', blogLink: '/blogPages/everlastings.html' },
    {eventName: 'Everlasting Kings Park Festival', calendar: 'Kings Park Everlastings', color: 'green', duration:'September', date: '2024-09-26', blogLink: '/blogPages/everlastings.html' },
    {eventName: 'Everlasting Kings Park Festival', calendar: 'Kings Park Everlastings', color: 'green', duration:'September', date: '2024-09-27', blogLink: '/blogPages/everlastings.html' },
    {eventName: 'Everlasting Kings Park Festival', calendar: 'Kings Park Everlastings', color: 'green', duration:'September', date: '2024-09-28', blogLink: '/blogPages/everlastings.html' },
    {eventName: 'Everlasting Kings Park Festival', calendar: 'Kings Park Everlastings', color: 'green', duration:'September', date: '2024-09-29', blogLink: '/blogPages/everlastings.html' },

    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-12', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-13', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-14', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-15', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-16', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-17', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-18', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-19', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-20', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-21', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-22', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-23', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-24', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-25', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-26', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-27', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-28', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-29', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-30', blogLink: '/blogPages/fall.html' },
    {eventName: 'Autumn Fall', calendar: 'Autumn Fall', color: 'amber', duration:'May', date: '2024-05-31', blogLink: '/blogPages/fall.html' },
    
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-12-22', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-12-23', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-12-24', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-12-25', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-12-26', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-12-27', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-12-28', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-12-29', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-12-30', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-12-31', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-01', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-02', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-03', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-04', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-05', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-06', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-07', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-08', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-09', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-10', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-11', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-12', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-13', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-14', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-15', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-16', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-17', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-18', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-19', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-20', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-21', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-22', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-23', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-24', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-25', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-26', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-27', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-28', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-29', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-30', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-01-31', blogLink: '/blogPages/camelia.html' },  
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-06-01', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-06-02', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-06-03', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-06-04', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-06-05', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-06-06', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-06-07', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia sasanqua', calendar: 'Camellia sasanqua', color: 'gray', duration:'April - June', date: '2024-06-08', blogLink: '/blogPages/camelia.html' },
    
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-12', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-13', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-14', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-15', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-16', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-17', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-18', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-19', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-20', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-21', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-22', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-23', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-24', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-25', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-26', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-27', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-28', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-29', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-08-30', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-09-01', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-09-02', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-09-03', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-09-04', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-09-05', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-09-06', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-09-07', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-09-08', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-09-09', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-09-10', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-09-11', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-09-12', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-09-13', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-09-14', blogLink: '/blogPages/camelia.html' },
    {eventName: 'Camellia japonica', calendar: 'Camellia japonica', color: 'gray', duration:'July - September', date: '2024-09-15', blogLink: '/blogPages/camelia.html' },

    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-02', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-03', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-04', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-05', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-06', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-07', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-08', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-09', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-10', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-11', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-12', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-13', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-14', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-15', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-16', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-17', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-18', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-19', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-20', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-21', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-22', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-23', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-24', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-25', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-26', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-27', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-28', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-29', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-30', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-09-31', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-01', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-02', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-03', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-04', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-05', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-06', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-07', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-08', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-09', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-10', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-11', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-12', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-13', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-14', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-15', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-16', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-17', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-18', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-19', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-20', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-21', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-22', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-23', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-24', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-25', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-26', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-27', blogLink: '/blogPages/wildflower.html' },
    {eventName: 'Perth  region wildflower best dates', calendar: ' Wildflower', color: 'darkGreen', duration:'September - October', date: '2024-10-28', blogLink: '/blogPages/wildflower.html' },
  
  ];


//can we get a [more info here] anchor tag?
  

  var calendar = new Calendar('#calendar', data);

}();


/*
The MIT License (MIT)

Copyright (c) 2023 Paul Navasard (https://codepen.io/peanav/pen/xxKWzG)
Fork of an original work Event Calendar Widget (non demo) (https://codepen.io/peanav/pen/xxKWzG)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/