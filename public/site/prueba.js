const Calendar = require("tui-calendar");
require("tui-calendar/dist/tui-calendar.css");
require("tui-date-picker/dist/tui-date-picker.css");
require("tui-time-picker/dist/tui-time-picker.css");

const calendar = new Calendar("#calendar", {
  defaultView: "month",
  taskView: true,
  template: {
    monthDayname: function (dayname) {
      return (
        '<span class="calendar-week-dayname-name">' + dayname.label + "</span>"
      );
    },
  },
});
