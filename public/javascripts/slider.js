var $slider, 
	$sliders,
	slider = new angular.module("slider", []);

angular.element(document).ready(function() {
	$slider = angular.element("#slider #sliders");
	$sliders = angular.element("> div:first", $slider);

	angular.element("[rel='tooltip']").tooltip();
	angular.element(".popover").popover();
	angular.element("body").removeClass("preload");
});

slider.directive("recordCreater", function($document) {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			var record = {}, 
				mousedown = false,
				r = {mouseClickY: 0, mouseCurrentY: 0, recordY: 0, recordWidth: 0};

			element.on("mousedown", function(event) {
				var recordActivity = scope.getActivity(scope.activities.value.name);;

				scope.day.records.push({
					activity: recordActivity,
					top: event.pageY - $sliders.offset().top,
					left: 38,
					width: 24,
					height: 0,
					created: false,
					time: ""
				});

				record = scope.day.records[scope.day.records.length - 1];
				r.mouseClickY = event.pageY - $sliders.offset().top;
				scope.$apply();

				mousedown = true;
			});

			$document.on("mousemove", function(event) {
				if (mousedown) {
					r.mouseCurrentY = event.pageY - $sliders.offset().top;
					var oldRecordHeight = record.height;

					if (r.mouseCurrentY - r.mouseClickY < 0) {
						record.top = Math.max(r.mouseCurrentY - r.mouseCurrentY % 15 - 15, 0);
						record.height = r.mouseClickY - record.top - r.mouseClickY % 15;
					} else {
						record.top = r.mouseClickY - r.mouseClickY % 15;
						record.height = r.mouseCurrentY - r.mouseClickY - (r.mouseCurrentY - r.mouseClickY) % 15 + 15;
					}

					if (oldRecordHeight != record.height) {
						scope.findOverlappingRecords(scope.$dayIndex);
					}

					scope.updateTimePointers(record, scope.$dayIndex);
					scope.timeTeller.hidden = true;
					record.time = ("0" + Math.floor(record.height / 3 / 60)).slice(-2) + ":" + ("0" + Math.floor(record.height / 3 % 60)).slice(-2);
					scope.$apply();
				}
			}).on("mouseup", function(event) {
				mousedown = false;
				scope.hideTimePointers();
				record.created = true;
				scope.$apply();
			});
		}
	}
});

slider.directive("recordResizer", function($document) {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			var record = {}, 
				mousedown = false,
				r = {
					mouseClickY: 0,
					mouseCurrentY: 0,
					recordY: 0,
					recordWidth: 0,
					recordMousedownTop: 0,
					resizeOffset: 0,
					recordMousedownWidth: 0
				};

			element.on("mousedown", function(event) {
				record = scope.record;
				r.mouseClickY = event.pageY - $sliders.offset().top;
				r.recordMousedownTop = record.top;
				r.recordMousedownWidth = record.height;
				r.resizeOffset = r.mouseClickY - record.top - (element.attr('class') == "drag-right" ? record.height : 0);
				mousedown = true;
			});

			$document.on("mousemove", function(event) {
				if (mousedown) {
					r.mouseCurrentY = event.pageY - $sliders.offset().top;
					var oldRecordWidth = record.height;

					if (element.attr('class') == "drag-right") {
						if (r.mouseCurrentY - r.mouseCurrentY % 3 - r.resizeOffset > r.recordMousedownTop) {
							record.top = r.recordMousedownTop;
							record.height = r.mouseCurrentY - r.recordMousedownTop - r.mouseCurrentY % 3 - r.resizeOffset;
						} else {
							record.top = r.mouseCurrentY - r.mouseCurrentY % 3 - r.resizeOffset;
							record.height = r.recordMousedownTop - r.mouseCurrentY + r.mouseCurrentY % 3 + r.resizeOffset;
						}
					} else {
						if (r.recordMousedownTop + r.recordMousedownWidth - r.mouseCurrentY + r.resizeOffset > 0) {
							record.top = r.mouseCurrentY - r.mouseCurrentY % 3 - r.resizeOffset;
							record.height = r.recordMousedownWidth + r.mouseClickY - r.mouseCurrentY + r.mouseCurrentY % 3;
						} else {
							record.top = r.recordMousedownTop + r.recordMousedownWidth;
							record.height = r.mouseCurrentY - r.mouseCurrentY % 3 - r.recordMousedownTop - r.recordMousedownWidth - r.resizeOffset;
						}
					}

					if (oldRecordWidth != record.width) {
						scope.findOverlappingRecords(scope.$dayIndex);
					}

					scope.updateTimePointers(record, scope.$dayIndex);
					scope.timeTeller.hidden = true;
					record.time = ("0" + Math.floor(record.height / 3 / 60)).slice(-2) + ":" + ("0" + Math.floor(record.height / 3 % 60)).slice(-2);
					scope.$apply();
				}
			}).on("mouseup", function(event) {
				mousedown = false;
			});
		}
	}
});

slider.directive('tooltip', function() {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			element.attr("title", scope.group.clients.join("<br>")).tooltip({placement: "right", html: true});
		}
	}
});

slider.controller("slider", function($scope) {
	$scope.settings = {
		currency: "$"
	};

	// $scope.timeRegex = /[0-9]{0,2}:[0-9]{0,2}/;
	// $scope.timeRegex = /(0?[0-9]|[0-5][0-9]):(0?[0-9]|[0-5][0-9])/;
	$scope.timeRegex = /[0-5]{0,2}::[0-5]{0,2}/;

	$scope.colors = [
		{name: "Red", hex: "#DC2127"},
		{name: "Green", hex: "#51B749"},
		{name: "Yellow", hex: "#FBD75B"},
		{name: "Blue", hex: "#5484ED"},
		{name: "Light Blue", hex: "#9FC6E7"},
		{name: "Purple", hex: "#DBADFF"},
		{name: "salmon", hex: "#FF887C"},
		{name: "grey", hex: "#E1E1E1"},
	];

	$scope.currencies = ["$", "€", "¥", "£", "฿"];

	$scope.groups = {
		groups: [
			{
				name: "Time Tab",
				clients: ["john.smith@gmail.com", "tim.tom@gmail.com"],
				categories: [
					{
						name: "work",
						activities: [
							{
								name: "python",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#DC2127"
							},
							{
								name: "java",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#51B749"
							},
							{
								name: "html5",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#FBD75B"
							},
							{
								name: "ruby",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#5484ED"
							},
							{
								name: "django",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#9FC6E7"
							},
							{
								name: "css",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#DBADFF"
							},
							{
								name: "javascript",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#FF887C"
							},
							{
								name: "jQuery",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#E1E1E1"
							}
						]
					},
					{
						name: "gardening",
						activities: [
							{
								name: "planting",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#FBD75B"
							},
							{
								name: "watering",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#DBADFF"
							},
							{
								name: "weed destroying",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#51B749"
							}
						]
					},
					{
						name: "computers",
						activities: [
							{
								name: "mac",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#E1E1E1"
							},
							{
								name: "windows",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#5484ED"
							},
							{
								name: "Linux",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#FBD75B"
							}
						]
					}
				]
			},
			{
				name: "Plumbing",
				clients: ["tits.magee@bangbros.com"],
				categories: [
					{
						name: "gardening",
						activities: [
							{
								name: "mowing",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#DC2127"
							},
							{
								name: "clipping",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#51B749"
							},
							{
								name: "planting",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#FBD75B"
							},
							{
								name: "watering",
								hourlyrate: 0,
								billable: false,
								currency: "$",
								color: "#5484ED"
							}
						]
					},
					{
						name: "longboarding",
						activities: [
							{
								name: "sliding",
								hourlyrate: false,
								billable: false,
								currency: "$",
								color: "#FBD75B"
							},
							{
								name: "downhill",
								hourlyrate: false,
								billable: false,
								currency: "$",
								color: "#DBADFF"
							},
							{
								name: "tricks",
								hourlyrate: false,
								billable: false,
								currency: "$",
								color: "#51B749"
							}
						]
					},
				]
			}
		],
		current: {}
	};

	$scope.clients = [
		{name: "John Smith", email: "john.smith@gmail.com"},
		{name: "Barney Stinson", email: "suitup@always.com"},
		{name: "Mother Tereser", email: "tits.magee@bangbros.com"},
		{name: "Tim Tom", email: "tim.tom@gmail.com"},
		{name: "James Bond", email: "james@bond.com"}
	];

	$scope.groups.current = $scope.groups.groups[0];

	$scope.activities = {
		value: $scope.groups.current.categories[0].activities[0],
		values: []
	};

	$scope.sidePanelShow = function(obj) {
		for (var o in obj)
			if (obj[o]) return true;

		return false
	};

	$scope.hidePanels = function(item) {
		item = item || "";

		item != "activities" ? $scope.panels.activities = false : $scope.panels.activities = !$scope.panels.activities;
		item != "newActivity" ? $scope.panels.newActivity = false : $scope.panels.newActivity = !$scope.panels.newActivity;
		item != "newCategory" ? $scope.panels.newCategory = false : $scope.panels.newCategory = !$scope.panels.newCategory;

		item != "groups" ? $scope.panels.groups = false : $scope.panels.groups = !$scope.panels.groups;
		item != "newGroup" ? $scope.panels.newGroup = false : $scope.panels.newGroup = !$scope.panels.newGroup;

		item != "clients" ? $scope.panels.clients = false : $scope.panels.clients = !$scope.panels.clients;
		item != "newClient" ? $scope.panels.newClient = false : $scope.panels.newClient = !$scope.panels.newClient;

		item != "recordInfo" ? $scope.panels.recordInfo = false : $scope.panels.recordInfo = !$scope.panels.recordInfo;

		item != "settings" ? $scope.panels.settings = false : $scope.panels.settings = !$scope.panels.settings;
	};

	$scope.panels = {
		activities: false,
		newActivity: false,
		newCategory: false,
		groups: false,
		newGroup: false,
		settings: false,
		clients: false,
		newClient: false,
		recordInfo: false
	};

	$scope.date = new Date();
	$scope.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	$scope.recordPopOver = {
		record: {},
		recordCopy: {}
	};

	$scope.groups

	$scope.findOverlappingRecords = function(day) {
		var sortedRecords = $scope.days[day].records.sort(function(a, b) {
			return a.top - b.top;
		});

		var groups = [],
			subGroups = [],
			lastEndTime = -1;

		sortedRecords.forEach(function(record, index) {
			if (subGroups.length) {
				if (lastEndTime <= record.top) {
					groups.push(subGroups);
					subGroups = [];
				}
			}

			for (var i = 0; i < subGroups.length; i++) {
				if (subGroups[i].length) {
					if (subGroups[i][subGroups[i].length - 1].top + subGroups[i][subGroups[i].length - 1].height <= record.top) {
						subGroups[i].push(record);
						lastEndTime = Math.max(lastEndTime, record.top + record.height);
						return;
					}
				}
			}

			subGroups.push([record]);
			lastEndTime = Math.max(lastEndTime, record.top + record.height);
		});

		groups.push(subGroups);

		groups.forEach(function(group) {
			group.forEach(function(subGroups, index) {
				var newLeft = 38 + (index * 31) - (group.length - 1) * 15.5;

				subGroups.forEach(function(record) {
					record.left = newLeft;
				});
			});
		});
	};

	$scope.showRecordInfo = function(record, day, e) {
		$scope.panels.recordInfo = true;
		$scope.recordPopOver.record = record;
		$scope.recordPopOver.recordCopy = angular.copy(record);
		$scope.recordPopOver.recordCopy.fromFormatTime = 
			("0" + Math.floor($scope.recordPopOver.recordCopy.top / 3 / 60)).slice(-2) + ":" + 
			("0" + Math.floor($scope.recordPopOver.recordCopy.top / 3 % 60)).slice(-2);
		$scope.recordPopOver.recordCopy.toFormatTime = 
			("0" + Math.floor(($scope.recordPopOver.recordCopy.top + $scope.recordPopOver.recordCopy.height) / 3 / 60)).slice(-2) + ":" + 
			("0" + Math.floor(($scope.recordPopOver.recordCopy.top + $scope.recordPopOver.recordCopy.height) / 3 % 60)).slice(-2);
		$scope.recordPopOver.recordCopy.billable = $scope.recordPopOver.recordCopy.activity.billable;
		$scope.recordPopOver.recordCopy.money = $scope.recordPopOver.recordCopy.activity.hourlyrate * ($scope.recordPopOver.recordCopy.height / 3 / 60).toFixed(2);
		$scope.recordPopOver.recordCopy.currency = $scope.recordPopOver.recordCopy.activity.currency;

	};

	$scope.days = [
		{
			name: "sun",
			longName: "Sunday",
			records: []
		}, 
		{
			name: "mon",
			longName: "Monday",
			records: []
		}, 
		{
			name: "tue",
			longName: "Tuesday",
			records: []
		}, 
		{
			name: "wed",
			longName: "Wednesday",
			records: []
		}, 
		{
			name: "thu",
			longName: "Thursday",
			records: []
		}, 
		{
			name: "fri",
			longName: "Friday",
			records: []
		}, 
		{
			name: "sat",
			longName: "Saturday",
			records: []
		}
	];

	$scope.convertTime = function(type, time){
		if(type == 24){
			period = "";
			time += period == "PM" ? 12 : 0;
		}else{
			period = ["AM", "PM", "PM"][Math.floor(time / 12)];
			time = (time + 11) % 12 + 1;
		}

		return {
			time: time,
			formatedTime: ("0" + time).slice(-2) + "00",
			period: period
		}
	}

	$scope.numberOfDays = function(year, month) {
		var d = new Date(year, month, 0);
		return d.getDate();
	}

	$scope.range = function(n) {
        return new Array(n);
    };
});

slider.controller("newActivity", function($scope) {
	$scope.reset = function() {
		$scope.activity = {currency: $scope.settings.currency};
	};

	$scope.create = function() {
		$scope.groups.current.categories.forEach(function(category) {
			category.name == $scope.activity.category ? category.activities.push(angular.copy($scope.activity)) : 0;
		});

		$scope.reset();
	};
});


slider.controller("newCategory", function($scope) {
	$scope.reset = function() {
		$scope.category = {};
	};

	$scope.create = function() {
		$scope.category.activities = [];
		$scope.groups.current.categories.push(angular.copy($scope.category));
		$scope.reset();
	};
});

slider.controller("newClient", function($scope) {
	$scope.reset = function() {
		$scope.client = {};
	};

	$scope.create = function() {
		$scope.client.name = ["James", "Alex", "Jainie", "Taylor", "Jordan"][Math.floor(Math.random() * 5)] + " " + ["Smith", "Jones", "Wilson", "Dover", "Doh"][Math.floor(Math.random() * 5)];
		$scope.clients.push(angular.copy($scope.client));
		$scope.reset();
	};
});

slider.controller("settings", function($scope) {

});

slider.controller("newGroup", function($scope) {
	$scope.reset = function() {
		$scope.group = {clients: []};
	};

	$scope.create = function() {
		$scope.group.clients = $scope.group.clients.filter(function(n) { return n; });
		$scope.groups.groups.push(angular.copy($scope.group));
		$scope.reset();
	};
});

slider.controller("recordInfo", function($scope) {
	$scope.fromFormatedTime = function() {
		console.log($scope.recordPopOver);
	};

	$scope.create = function() {
		timeRegex.test($scope.recordPopOver.recordCopy.fromFormatTime) && timeRegex.test($scope.recordPopOver.recordCopy.fromFormatTime) && 
		military_time_from.Time >= 0 && military_time_from.Time <= 24 && military_time_to.Time >= 0 && military_time_to.Time <= 24 &&
		from_val[1] < 60 && to_val[1] < 60 &&
		military_time_from.Time * 60 + parseInt(from_val[1]) < military_time_to.Time * 60 + parseInt(to_val[1])
	};

	$scope.delete = function() {
		for (var i = 0; i < $scope.days.length; i++) {
			for (var j = 0; j < $scope.days[i].records.length; j++) {				
				if ($scope.recordPopOver.record == $scope.days[i].records[j]) {
					$scope.days[i].records.splice(j, 1);
					break;
				}
			}
		}
	};
});

slider.controller("sliderOptions", function($scope) {
	$scope.groups.current.categories.forEach(function(category) {
		category.activities[0] && !$scope.activities.value ? $scope.activities.value = category.activities[0] : 0;
		category.activities.forEach(function(activity) {
			$scope.activities.values.push(activity);
		});
	});
});

slider.controller("sliderTimeTracker", function($scope, $element) {
	$scope.timeTeller = {
		hide: function(trueOrFalse) { this.hidden = trueOrFalse || false; },
		hidden: true,
		arrowTop: false,
		day: "",
		left: 0,
		top: 0,
		formatedTime: "00:00"
	};

	$scope.timepointers = [
		{left: 0, top: 0, type: "left", show: false, formatedTime: "00:00"},
		{left: 0, top: 0, type: "right", show: false, formatedTime: "00:00"}
	];

	$scope.getActivity = function(activityName) {
		var desiredActivity;

		$scope.groups.current.categories.forEach(function(category) {
			category.activities.forEach(function(activity) {
				activity.name == activityName ? desiredActivity = activity : 0;
			});
		});

		return desiredActivity;
	};

	$scope.currentDate = new Date();

	+function updateTime(scope, start) {
		scope.currentDate = new Date();
		start || scope.$apply();
		setTimeout(function() { updateTime(scope, false); }, 1000);
	}($scope, true);

	$scope.updateTimeTeller = function(e) {
		var hours = Math.floor((e.pageY - $sliders.offset().top) / 180);
		var width = Math.floor((e.pageY - $sliders.offset().top) / 3 % 60);
		$scope.timeTeller.formatedTime = ("0" + hours).slice(-2) + ":" + ("0" + (width - width % 5)).slice(-2);

		$scope.timeTeller.left = e.pageX - $slider.offset().left;
		$scope.timeTeller.top = e.pageY - $slider.offset().top;
		$scope.timeTeller.day = $scope.days[Math.floor(100 / $slider.width() * ($scope.timeTeller.left + 1) / (100 / 7))].longName; 
		
		if ($scope.days[$scope.currentDate.getDay()].longName == $scope.timeTeller.day && $scope.currentDate.getHours() * 180 + $scope.currentDate.getMinutes() * 3 <= e.pageY - $sliders.offset().top && $scope.currentDate.getHours() * 180 + $scope.currentDate.getMinutes() * 3 >= e.pageY - $sliders.offset().top - 4) {
			$scope.timeTeller.formatedTime = "The current time is " + ("0" + $scope.currentDate.getHours()).slice(-2) + ":" + ("0" + $scope.currentDate.getMinutes()).slice(-2);
		}

		$("", $element).width()

		$scope.timeTeller.arrowTop = true;
		$scope.timeTeller.top - 70 < 0 ? $scope.timeTeller.top += 105 : $scope.timeTeller.arrowTop = false;
	};

	$scope.updateTimePointers = function(record, day) {
		$scope.timepointers[0].top = record.top - 50 + $sliders.offset().top - $slider.offset().top;
		$scope.timepointers[0].type = "bottom";
		$scope.timepointers[1].type = "top";

		$scope.timepointers[0].formatedTime = ("0" + Math.floor(record.top / 3 / 60)).slice(-2) + ":" + ("0" + Math.floor(record.top / 3 % 60)).slice(-2);

		$scope.timepointers[1].top = Math.min(record.top + record.height + 20 + $sliders.offset().top - $slider.offset().top, $slider.width() - 100);
		$scope.timepointers[1].formatedTime = ("0" + Math.floor((record.top + record.height) / 3 / 60)).slice(-2) + ":" + ("0" + Math.floor((record.top + record.height) / 3 % 60)).slice(-2);

		if (record.top - 50 + $sliders.offset().top - $slider.offset().top < 10) {
			$scope.timepointers[0].type = "top";
			$scope.timepointers[0].top += 70;
		}
		
		if (record.top + record.height + $sliders.offset().top - $slider.offset().top > $slider.height() - 60) {
			$scope.timepointers[1].type = "bottom";
			$scope.timepointers[1].top -= 70;
		}

		$scope.timepointers[0].top = Math.max($scope.timepointers[0].top, 20);
		$scope.timepointers[1].top = Math.min($scope.timepointers[1].top, $slider.height() - 50);

		$scope.timepointers.forEach(function(timepointer) {
			timepointer.left = day * (100 / 7) + record.left / 7 + record.width / 14;// + record.left / 7 + ((record.height) / 14));
			timepointer.show = true;
		});
	};

	$scope.hideTimePointers = function() {
		$scope.timepointers.forEach(function(element) {
			element.show = false;
		});
	};

});

slider.controller("activities", function($scope) {
});