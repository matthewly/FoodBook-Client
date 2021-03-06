var mp4Services = angular.module('mp4Services', []);

mp4Services.factory('Users', function($http, $window) {
//     var baseUrl = $window.sessionStorage.baseurl;
var baseUrl = 'http://104.236.106.65:4000';
    return {
        getAllUsers : function() {
            return $http.get(baseUrl+'/api/users');
        },
        addUser : function(data) {
            return $http.post(baseUrl+'/api/users', data);
        },
        deleteUser : function(userId) {
            return $http.delete(baseUrl+'/api/users/'+userId);
        },
        getUser : function(userId) {
            console.log(baseUrl+'/api/users/'+userId);
            return $http.get(baseUrl+'/api/users/'+userId);
        },
        updateUser : function(userId, data) {
          return $http.put(baseUrl+'/api/users/'+userId, data);
        }
    }
});


mp4Services.factory('Events', function($http, $window) {
    // var baseUrl = $window.sessionStorage.baseurl;
    var baseUrl = 'http://104.236.106.65:4000';
    return {
        getAllEvents : function() {
            return $http.get(baseUrl+"/api/events");
        },
        getEventsByHost : function(userId) {
            return $http.get(baseUrl+"/api/events?where={'host':'" + userId + "}");
        },
         updateEvent : function(eventId, data) {
           return $http.put(baseUrl+'/api/events/'+ eventId, data);
         },
         deleteEvent: function(eventId) {
           return $http.delete(baseUrl+'/api/events/'+eventId);
         },
         getEvent: function(eventId) {
           return $http.get(baseUrl+'/api/events/'+eventId);
         },
         addEvent: function(data) {
            return $http.post(baseUrl+'/api/events/',data);
         }
    }
});
