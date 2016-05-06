var mp4Controllers = angular.module('mp4Controllers', []);

mp4Controllers.controller('EventDetailController', ['$scope', '$http','$rootScope','$routeParams' , '$window','Events','Users', function($scope, $http,$rootScope,$routeParams, $window,Events,Users) {
    $rootScope.curr_user = JSON.parse($window.sessionStorage.curr_user);
  $scope.data = "";
  $scope.user = {};
  $scope.eid = $routeParams.id;
  $scope.id = $routeParams.id;
  $scope.hid = "";
  //console.log($routeParams.id);

  $scope.event = {};
  $scope.attendents=[];
  Events.getEvent($routeParams.id).success(function(data){

      $scope.event = data.data;
      if($scope.event.attending.indexOf($rootScope.curr_user._id) === -1){
          $scope.isActive = true;
          $scope.rsvpText = "RSVP";
      }
        else {
          $scope.isActive = false;
          $scope.rsvpText = "Cancel";
      }
    //  console.log("event: "+$scope.event);
      Users.getUser($scope.event.hostId).success(function(data){

      $scope.user = data.data.local;
      console.log($scope.user);
      $scope.hid = data.data._id;
      $scope.event.time = dateFormat($scope.event.time);
      $scope.event.hour = timeFormat($scope.event.hour);
       });

      for (var i = 0; i < $scope.event.attending.length; i++) {
      Users.getUser($scope.event.attending[i]).success(function(data){
          $scope.attendents.push(data.data.local.name);
      });

      // if(!$scope.event.attending){
      //   $scope.attendents = '';
      // }
      // $scope.event.attending[i]
  }

  });

  $scope.rsvpUser = function(uid,eid) {

    //update the event.attending[] to include the uid.
    //update the user's attending [] to include eid

    Events.getEvent(eid).success(function(data){
      $scope.isActive = !$scope.isActive;
      if($scope.isActive)
        $scope.rsvpText = "RSVP";
      else
        $scope.rsvpText = "Cancel";
        console.log("waaaa" + data.data.attending);

          if(data.data.attending.indexOf(uid) === -1){
            console.log("xixixi" + data.data.attending);
             data.data.attending.push(uid);
             console.log("after" + data.data.attending);
          }else {
            data.data.attending.splice(data.data.attending.indexOf(uid), 1);
          }
            Events.updateEvent(eid,data.data).success(function(data_0){
              Events.getEvent($routeParams.id)
                .success(function(data){
                  $scope.event = data.data;
                  console.log($scope.event.attending);
                  $scope.event.time = dateFormat($scope.event.time);
                  $scope.event.hour = timeFormat($scope.event.hour);
                    if($scope.event.attending.indexOf($rootScope.curr_user._id) === -1) {
                       $scope.isActive = true;
                       $scope.rsvpText = "RSVP"
                    }
                    else {
                       $scope.isActive = false;
                       $scope.rsvpText = "Cancel";
                   }
                  
                   Users.getUser($scope.event.hostId).success(function(data){

                       $scope.user = data.data.local;
                       $scope.hid = data.data._id;

                    });

                   for (var i = 0; i < $scope.event.attending.length; i++) {
                   Users.getUser($scope.event.attending[i]).success(function(data){
                       $scope.attendents.push(data.data.local.name);
                   });

                   // if(!$scope.event.attending){
                   //   $scope.attendents = '';
                   // }
                   // $scope.event.attending[i]
               }

              });
            });

    });




    Users.getUser(uid).success(function(data){
       if(data.data.local.attending.indexOf(eid) === -1){
           data.data.local.attending.push(eid);
       } else {
         data.data.local.attending.splice(data.data.local.attending.indexOf(eid), 1);
       }
           Users.updateUser(uid,data.data.local).success(function(data_0){
               Users.getUser($rootScope.curr_user._id).success(function(user){
                   $rootScope.curr_user = user.data;
                   $window.sessionStorage.setItem('curr_user', JSON.stringify(user.data));
               });
           });
    });

  }



  $scope.remove = function(eid){
      console.log(eid);
      //remove the event from users
      //remove from host user
      //remove the event

      for (var i = 0; i < $scope.event.attending.length; i++) {
      Users.getUser($scope.event.attending[i]).success(function(data){
          data.data.local.attending.splice(eid,1);
          Users.updateUser(data.data._id,data.data).success(function(d1){
              Users.getUser($rootScope.curr_user._id).success(function(user){
                  $rootScope.curr_user = user.data;
                  $window.sessionStorage.setItem('curr_user', JSON.stringify(user.data));
              });
              console.log('removed from list');
          });
      });
    }

      Users.getUser($rootScope.curr_user._id).success(function(data){
            data.data.local.hosting.splice(eid,1);
            console.log('removed from host');
      });

      Events.deleteEvent(eid).success(function(d1){
          console.log("event removed");
      });

  }

  // console.log($scope.hid);




        //   $scope.map = new google.maps.Map(document.getElementById('map'), {
        //   center: {lat: 40.10195230000001, lng: -88.22716149999997},
        //   // (40.10195230000001, -88.22716149999997)
        //   zoom: 13
        // });
 // $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

  //Tasks.getSpecific($routeParams.id).success(function(usr,detail){$scope.task = usr.data;});
}]);

mp4Controllers.controller('EditEventController', ['$scope', '$http','$rootScope','$routeParams' ,'$window','Events','Users', function($scope, $http,$rootScope,$routeParams, $window,Events,Users) {
  $rootScope.curr_user = JSON.parse($window.sessionStorage.curr_user);
  console.log('edit event' + $routeParams.eventId);
  // console.log($scope.data.hour);
  $scope.data = {};


  $scope.editEvent = function(){

    console.log($scope.data);
    var newData = {
      name: $scope.data.name,
      time: $scope.data.time,
      hour: $scope.data.hour.toLocaleTimeString(),
      place: $scope.data.place,
      description: $scope.data.description,
      host: $scope.data.host,
      hostId: $scope.data.hostId,
      attending: $scope.data.attending,
      maximumLimit: $scope.data.maximumLimit,
      completed: $scope.data.completed,
      foodstyle: $scope.data.foodstyle,
      occassion: $scope.data.occassion
    }
    console.log(newData);

      Events.updateEvent($routeParams.eventId,newData).success(function(data){
            console.log('updated');
      });
  };

  Events.getEvent($routeParams.eventId).success(function(data){
    $scope.data = data.data;
        console.log($scope.data);

    $scope.data.time = new Date($scope.data.time);
    $scope.data.hour = new Date($scope.data.hour);
    $scope.data.maximumLimit = parseInt($scope.data.maximumLimit);
    // var str = $scope.data.hour.split(":");
    // var str_1 = str[2].substr(2,3);
    // console.log('hour'+str[0]);
    // var hourHand = 0;
    // console.log("str1==" + str_1);
    // if(str_1 === " PM"){
      // hourHand = parseInt(str[0]) + 12;
    // }else{
      // hourHand = parseInt(str[0]);
    // }
    // $scope.data.hourl = new Date($scope.data.time.getYear(),$scope.data.time.getMonth(),$scope.data.time.getDate(),hourHand,str[1],str[2].substr(0,2));

  });
  $scope.editEvent = function(){
    console.log($scope.data);
    // var lmt = $scope.data.maximumLimit;
    // console.log(lmt);
    // var c = $scope.data.hourl.getHours() + " "+$scope.data.hourl.getMinutes();
    // console.log(c);
    var b = $scope.data;

      Events.updateEvent($routeParams.eventId,b).success(function(dat1a){
            console.log('updated');
            console.log(dat1a);
      });
  };
}]);

mp4Controllers.controller('NewsFeedController', ['$scope', '$window','$rootScope', 'Events','Users', function($scope, $window, $rootScope, Events, Users) {
   $rootScope.curr_user = JSON.parse($window.sessionStorage.curr_user);
   $scope.events = {};
   // $scope.showOption = "where={}";
   $scope.order = "1";
   $scope.sortBy = "name";
   $scope.friends = 1;
   $scope.events = {};
   $scope.skip = 0;
   $scope.eventsLength =0;

   Events.getEvent(("?sort={" + $scope.sortBy + ":" + $scope.order + "}"+"&skip=" +$scope.skip+"&limit=10"))
     .success(function(data){
       $scope.events = data.data;
       Events.getAllEvents().success(function(d1){
          $scope.eventsLength = d1.data.length;
       });
       console.log($scope.eventsLength);
       for (var i = 0; i < $scope.events.length; i++) {

          $scope.events[i].time = dateFormat($scope.events[i].time);
          if($scope.events[i].hour){
                      $scope.events[i].hours = timeFormat($scope.events[i].hour);
          }
            // initialize attending
           if($scope.events[i].attending.indexOf($rootScope.curr_user._id) === -1) {
              $scope.events[i].isActive = true;
              $scope.events[i].rsvpText = "RSVP"
           }
           else {
              $scope.events[i].isActive = false;
              $scope.events[i].rsvpText = "Cancel";
          }
       }

   });

     $scope.update = function() {
      var where;
      if($scope.friends == 1) //all
      {
          where = '';
      }
      else //friends
      {
        var temp;
        if($rootScope.curr_user.local.following.length == 0)
          temp = "";
        else
          temp = '"' + $rootScope.curr_user.local.following.join('","') + '"';
        where = '"hostId": {"$in":[' + temp + ']}';
      }

      Events.getEvent(("?where={" + where + "}&sort={" + $scope.sortBy + ":" + $scope.order + "}"+"&skip=" +$scope.skip+"&limit=10"))
     .success(function(data){
       $scope.events = data.data;
       Events.getAllEvents().success(function(d1){
          $scope.eventsLength = d1.data.length;
       });
       for (var i = 0; i < $scope.events.length; i++) {

          $scope.events[i].time = dateFormat($scope.events[i].time);
          if($scope.events[i].hour){
                      $scope.events[i].hours = timeFormat($scope.events[i].hour);
          }
            // initialize attending
           if($scope.events[i].attending.indexOf($rootScope.curr_user._id) === -1) {
              $scope.events[i].isActive = true;
              $scope.events[i].rsvpText = "RSVP"
           }
           else {
              $scope.events[i].isActive = false;
              $scope.events[i].rsvpText = "Cancel";
          }
       }

   });



     };

   $scope.rsvpUser = function(uid,eid) {

     //update the event.attending[] to include the uid.
     //update the user's attending [] to include eid

     Events.getEvent(eid).success(function(data){
           if(data.data.attending.indexOf(uid) === -1){
              data.data.attending.push(uid);
           }else {
             data.data.attending.splice(data.data.attending.indexOf(uid), 1);
           }
             Events.updateEvent(eid,data.data).success(function(data_0){
               Events.getEvent(("?sort={" + $scope.sortBy + ":" + $scope.order + "}"+"&skip=" +$scope.skip+"&limit=10"))
                 .success(function(data){
                   $scope.events = data.data;
                   for (var i = 0; i < $scope.events.length; i++) {
                        // initialize attending
                       $scope.events[i].time = dateFormat($scope.events[i].time);
                       if($scope.events[i].hour){
                      $scope.events[i].hours = timeFormat($scope.events[i].hour);
          }
                       if($scope.events[i].attending.indexOf($rootScope.curr_user._id) === -1) {
                          $scope.events[i].isActive = true;
                          $scope.events[i].rsvpText = "RSVP"
                       }
                       else {
                          $scope.events[i].isActive = false;
                          $scope.events[i].rsvpText = "Cancel";
                      }

                   }
               });
             });

     });




     Users.getUser(uid).success(function(data){
        if(data.data.local.attending.indexOf(eid) === -1){
            data.data.local.attending.push(eid);
        } else {
          data.data.local.attending.splice(data.data.local.attending.indexOf(eid), 1);
        }
            Users.updateUser(uid,data.data.local).success(function(data_0){
                Users.getUser($rootScope.curr_user._id).success(function(user){
                    $rootScope.curr_user = user.data;
                    $window.sessionStorage.setItem('curr_user', JSON.stringify(user.data));
                });
                  console.log("Updated user's attending []");
            });
     });

   }


   $scope.toggleActive = function(index) {
    // console.log($scope.events[index]);
       $scope.events[index].isActive = !$scope.events[index].isActive;
       if($scope.events[index].isActive)
         $scope.events[index].rsvpText = "RSVP";
       else
         $scope.events[index].rsvpText = "Cancel";
  };
  //
  $scope.$watchGroup(['sortBy','showOption','order','skip'], function (newVal, oldVal) {
       Events.getEvent("?sort={" + $scope.sortBy + ":" + $scope.order + "}&" + $scope.showOption +"&skip=" +$scope.skip+"&limit=10")
         .success(function(data){
           $scope.events = data.data;
           for (var i = 0; i < $scope.events.length; i++) {
                // initialize attending
               $scope.events[i].time = dateFormat($scope.events[i].time);
               if($scope.events[i].hour){
                      $scope.events[i].hours = timeFormat($scope.events[i].hour);
          }
               if($scope.events[i].attending.indexOf($rootScope.curr_user._id) === -1) {
                  $scope.events[i].isActive = true;
                  $scope.events[i].rsvpText = "RSVP"
               }
               else {
                  $scope.events[i].isActive = false;
                  $scope.events[i].rsvpText = "Cancel";
              }

           }

       });
     }, true);

   $scope.prev = function() {
     $scope.skip -= 10;
     if($scope.skip < 0)
        $scope.skip = 0;
   };
   $scope.next = function() {
     if($scope.events.length == 10) {
        $scope.skip += 10;
      }
   };

   $scope.nextFlag = function() {
     if($scope.eventsLength > ($scope.skip + 10)){
        // console.log($scope.eventsLength);
       return false;
     }
     else
       return true;
   };


}]);

//user list
mp4Controllers.controller('UserController', ['$scope', '$rootScope', '$window', 'Users', function($scope, $rootScope, $window, Users) {
    $rootScope.curr_user = JSON.parse($window.sessionStorage.curr_user);
   $scope.users = {};
   $scope.predicate = 'name';

   Users.getAllUsers().success(function(users) {
      $scope.users = users.data;
      for(var i = 0; i < $scope.users.length; i++){
        if($rootScope.curr_user.local.following.indexOf($scope.users[i]._id) === -1) {
          $scope.users[i].isActive = true;
          $scope.users[i].followText = "follow";
        } else {
         $scope.users[i].isActive = false;
         $scope.users[i].followText = "unfollow";
       }
      }
   }).error(function(err) {
    if (err)
      console.log("error");
   });

   $scope.follow = function(userID, index){
     console.log($scope.users[index]);
      //toggle active
       $scope.users[index].isActive = !$scope.users[index].isActive;
       if($scope.users[index].isActive)
         $scope.users[index].followText = "follow";
       else
         $scope.users[index].followText = "unfollow";

       Users.getUser($rootScope.curr_user._id).success(function(data){
          if(data.data.local.following.indexOf(userID) === -1)
              data.data.local.following.push(userID);
          else
              data.data.local.following.splice(data.data.local.following.indexOf(userID), 1);
          Users.updateUser($rootScope.curr_user._id, data.data.local).success(function(data_0){
            Users.getUser($rootScope.curr_user._id).success(function(user){
                $rootScope.curr_user = user.data;
                $window.sessionStorage.setItem('curr_user', JSON.stringify(user.data));
            });
                console.log("Updated user's friends []");
          });
     });
    }
}]);

// add user
mp4Controllers.controller('AddUserController', ['$scope', '$window', '$routeParams', 'Users'  , function($scope, $window, $routeParams, Users) {
    $rootScope.curr_user = JSON.parse($window.sessionStorage.curr_user);
   $scope.data = {};

   $scope.addUser = function(){
     $scope.data.dateCreated = new Date().getTime();
    // console.log($scope.data);
     Users.addUser($scope.data)
      .success(function(data) {
       $scope.data = {};
       $scope.errorMessage = "";
       $scope.successMessage = "User " + data.data.name + " has been added!";
       //$window.location.replace('#/users');
     })
      .error(function(err) {
        $scope.successMessage = "";
        $scope.errorMessage = err.message;
        if(err)
          console.log($scope.error);
      });
   };
}]);
/*
  $scope.setData = function(){
    CommonData.setData($scope.data);
    $scope.displayText = "Data set"

  };
*/

// add user
mp4Controllers.controller('EditUserController', ['$scope', '$rootScope', '$window', '$routeParams', '$http', 'Users', function($scope, $rootScope, $window, $routeParams, $http, Users) {
   /* Get user data passportjs */
    $rootScope.curr_user = JSON.parse($window.sessionStorage.curr_user);

   $scope.user = $rootScope.curr_user;

   $scope.name = $scope.user.local.name;
   $scope.email = $scope.user.local.email;
   $scope.phoneNumber = $scope.user.local.phoneNumber;
   $scope.gender = $scope.user.local.gender;
    $scope.image = $scope.user.local.image;
   $scope.edit_user = function(user) {
      $scope.editUser = {
        name: $scope.name,
        email: $scope.email,
        password: $scope.user.local.password,
        phoneNumber: $scope.phoneNumber,
        gender: $scope.gender,
        image: $scope.image,
        attending: $scope.user.local.attending,
        hosting: $scope.user.local.hosting,
        history: $scope.user.local.history,
        following: $scope.user.local.following
      };
      // console.log($scope.editUser);
      Users.updateUser($scope.user._id, $scope.editUser).success(function(data) {
          Users.getUser($rootScope.curr_user._id).success(function(user){
              $rootScope.curr_user = user.data;
              $window.sessionStorage.setItem('curr_user', JSON.stringify(user.data));
              $scope.user = user.data;
          });


        $scope.name = $scope.user.local.name;
          console.log($scope.name);
        $scope.email = $scope.user.local.email;
        $scope.phoneNumber = $scope.user.local.phoneNumber;
        $scope.gender = $scope.user.local.gender;

          $scope.message = "User edited!";
      }).error(function(err) {
          console.log("Couldn't edit user");
      });
   };


}]);

//task list
mp4Controllers.controller('TaskController', ['$scope', '$window','CommonData', 'Users', 'Tasks', function($scope, $window, CommonData, Users, Tasks) {
    $rootScope.curr_user = JSON.parse($window.sessionStorage.curr_user);

   $scope.tasks = {};
   $scope.showOption = "where={'completed':false}";
   $scope.order = "1";
   $scope.sortBy = "dateCreated"
   $scope.tasksLength = 0;
   CommonData.getTasks("?sort={" + $scope.sortBy + ":" + $scope.order + "}&" + $scope.showOption +"&skip=" +$scope.skip+"&limit=10")
     .success(function(data){
       //console.log("?sort={" + $scope.sortBy + ":" + $scope.order + "}&" + $scope.showOption +"&skip=" +$scope.skip+"&limit=10");
       $scope.tasks = data.data;
       for (var i = 0; i < $scope.tasks.length; i++) {
         $scope.tasks[i].deadline = dateFormat($scope.tasks[i].deadline);
       }
   });

   $scope.deleteTask = function(index){
     // If a task is deleted, it should be deleted from the `pendingTasks` array of the user it was assigned to
     if($scope.tasks[index].assignedUser) {
       Users.getUser($scope.tasks[index].assignedUser)
          .success(function(data) {
             var user = data.data;
             for (var i = 0; i < user.pendingTasks.length; i++) {
               if($scope.tasks[index]._id === user.pendingTasks[i])
                  user.pendingTasks.splice(i, 1);
             }
             Users.updateUser(user._id, user)
                .success(function(data) {
                  console.log("successfully update user");
                })
                .error(function(err){
                  console.log("fail to update user");
                });
           })
           .error(function(err) {
               console.log("fail to get user");
           });
     }

     Tasks.deleteTask($scope.tasks[index]._id)
        .success(function() {
          $scope.tasks = {};
          $scope.tasksLength -= 1;
         // console.log("delete" + $scope.tasksLength);
          CommonData.getTasks("?sort={" + $scope.sortBy + ":" + $scope.order + "}&" + $scope.showOption +"&skip=" +$scope.skip+"&limit=10")
            .success(function(data){
              $scope.tasks = data.data;
              for (var i = 0; i < $scope.tasks.length; i++) {
                $scope.tasks[i].deadline = dateFormat($scope.tasks[i].deadline);
              }
          });
        })
        .error(function(err) {
          console.log("fail to delete task");
        });
   };

   $scope.skip = 0;
   $scope.prev = function() {
     $scope.skip -= 10;
     if($scope.skip < 0)
        $scope.skip = 0;
   };
   $scope.next = function() {
     if($scope.tasks.length == 10) {
        $scope.skip += 10;
      }
   };

   $scope.nextFlag = function() {
     if($scope.tasksLength > ($scope.skip + 10))
       return false;
     else
       return true;
   };

     $scope.$watchGroup(['sortBy','showOption','order','skip'], function (newVal, oldVal) {
            CommonData.getTasks("?sort={" + $scope.sortBy + ":" + $scope.order + "}&" + $scope.showOption +"&skip=" +$scope.skip+"&limit=10")
              .success(function(data){
                // get taskLength
                CommonData.getTasks("?" + $scope.showOption)
                 .success(function(data) {
                   $scope.tasksLength = data.data.length;
                 });

                $scope.tasks = data.data;
                for (var i = 0; i < $scope.tasks.length; i++) {
                  $scope.tasks[i].deadline = dateFormat($scope.tasks[i].deadline);
                }
            });
    }, true);
}]);

mp4Controllers.controller('AddTaskController', ['$scope', '$window', '$routeParams', 'CommonData', 'Users' , 'Tasks', function($scope, $window, $routeParams, CommonData, Users, Tasks) {
    $rootScope.curr_user = JSON.parse($window.sessionStorage.curr_user);

$scope.data = {};
$scope.assignedUser = "";
$scope.users = {};
CommonData.getUsers()
  .success(function(data){
    $scope.users = data.data;
});

$scope.addTask = function(){
  console.log($scope.data.deadline);
    //$scope.data.deadline = Date.parse($scope.data.deadline);
    $scope.data.completed = false;
    if($scope.assignedUser) {
      $scope.data.assignedUser = $scope.users[$scope.assignedUser]._id;
      $scope.data.assignedUserName = $scope.users[$scope.assignedUser].name;
    }

    Tasks.addTask($scope.data)
        .success(function(data){
        $scope.errorMessage = "";
        $scope.successMessage = "Task " + data.data.name + " has been added!";
        if($scope.assignedUser) {
            $scope.data = {};
            $scope.users[$scope.assignedUser].pendingTasks.push(data.data._id);

            Users.updateUser($scope.users[$scope.assignedUser]._id,$scope.users[$scope.assignedUser])
                .success(function(data){
                    console.log("task added sucesssfully");
                }).error(function(err){
                if(err)
                    console.log("fail to update user " + err);
            });
      }
    }).error(function(err){
        if(err) {
          $scope.errorMessage = err.message;
          $scope.successMessage = "";
          console.log("fail to add task"+err);
        }
    });

};
}]);

// task details
mp4Controllers.controller('TaskDetailController', ['$scope', '$window','$routeParams' ,'Tasks', function($scope, $window, $routeParams, Tasks) {
    $rootScope.curr_user = JSON.parse($window.sessionStorage.curr_user);
    $scope.task = {};

    Tasks.getTask($routeParams.taskId)
      .success(function(data){
        $scope.task = data.data;
        $scope.task.deadline = dateFormat($scope.task.deadline);
        $scope.task.dateCreated = dateFormat($scope.task.dateCreated);

    }).error(function(err){
        if(err)
            console.log(err);
    });

}]);

//user details

mp4Controllers.controller('ProfileController', ['$scope', '$window','$rootScope', '$routeParams', '$http', 'Users', 'Events', function($scope, $window, $rootScope, $routeParams, $http, Users, Events) {
    $rootScope.curr_user = JSON.parse($window.sessionStorage.curr_user);
 Users.getUser($routeParams.userId).success(function(data) {
    $scope.user = data.data;
    if($rootScope.curr_user.local.following.indexOf($scope.user._id) === -1){
        $scope.isActive = true;
        $scope.followText = "follow";
    }
      else {
        $scope.isActive = false;
        $scope.followText = "unfollow";
    }
    var hostingIds;
      if($scope.user.local.hosting.length == 0)
        hostingIds = "";
      else
        hostingIds = '"' + $scope.user.local.hosting.join('","') + '"';

          var where = '"_id": {"$in":[' + hostingIds+ ']}';
         // console.log('?where={' + where + '}');
          Events.getEvent('?where={' + where + '}').success(function(data){
          $scope.eventsHosting = data.data;
         // console.log($scope.eventsHosting);
      });

      var attendingIds;
      if($scope.user.local.attending.length == 0)
        attendingIds = "";
      else
        attendingIds = '"' + $scope.user.local.attending.join('","') + '"';
          where = '"_id": {"$in":[' + attendingIds+ ']}';
          Events.getEvent('?where={' + where + '}').success(function(data){
          $scope.eventsAttending = data.data;
        //  console.log($scope.eventsAttending);
      });

    }).error(function(err) {
      if (err)
        console.log(err);
 });


 /*follow*/

    $scope.follow = function(userID){
        $scope.isActive = !$scope.isActive;
        if($scope.isActive)
          $scope.followText = "follow";
        else
          $scope.followText = "unfollow";

        Users.getUser($rootScope.curr_user._id).success(function(data){
           if(data.data.local.following.indexOf(userID) === -1)
               data.data.local.following.push(userID);
           else
               data.data.local.following.splice(data.data.local.following.indexOf(userID), 1);
           Users.updateUser($rootScope.curr_user._id, data.data.local).success(function(data_0){
             Users.getUser($rootScope.curr_user._id).success(function(user){
                 $rootScope.curr_user = user.data;
                 $window.sessionStorage.setItem('curr_user', JSON.stringify(user.data));
             });
                 console.log("Updated user's friends in list");
           });
      });
     }

  /* Get user data passportjs */

   //$scope.id = $routeParams.userId;

}]);


// can we edit the date in edit task?
mp4Controllers.controller('EditTaskController', ['$scope', '$window','$routeParams' ,'Tasks', 'CommonData', function($scope, $window, $routeParams, Tasks, CommonData) {
    $rootScope.curr_user = JSON.parse($window.sessionStorage.curr_user);
    $scope.task = {};
    $scope.users = {};
    $scope.userIndex = 0;
    $scope.task.deadline;
    Tasks.getTask($routeParams.taskId)
      .success(function(data){
        $scope.task = data.data;
        $scope.task.deadline = dateFormat($scope.task.deadline);
      })
      .error(function(err){
        console.log(err);
    });

    CommonData.getUsers()
      .success(function(data){
        $scope.users = data.data;
        var user;
        var index;
        for (var i = 0; i < $scope.users.length; i++) {
          if($scope.users[i]._id === $scope.task.assignedUser) {
             index = i;
             user = $scope.users[i];
          }
        }
        $scope.users.splice(index, 1);
        $scope.users.unshift(user);
    });

    $scope.updateEditTask = function(){
      if($scope.userIndex) {
        $scope.task.assignedUser = $scope.users[$scope.userIndex]._id;
        $scope.task.assignedUserName = $scope.users[$scope.userIndex].name;
      }

        Tasks.updateTask($routeParams.taskId, $scope.task)
        .success(function(data){
            $scope.errorMessage = "";
            $scope.successMessage = "Task has been edited!";

        })
        .error(function(err){
            if(err) {
              $scope.errorMessage = err.message;
              $scope.successMessage = "";
            }
        });
    };

}]);


mp4Controllers.controller('LoginController', ['$scope', '$window','$rootScope', '$http', '$location', function($scope, $window, $rootScope, $http, $location) {

    $scope.user = {};
    $rootScope.curr_user = '';

    $scope.login = function(){
        $http.post('/login', {
          email: $scope.user.email,
          password: $scope.user.password,
        })
        .success(function(user){
          // No error: authentication OK
          $rootScope.message = 'Authentication successful!';

          $rootScope.curr_user = user;
            $window.sessionStorage.setItem('curr_user', JSON.stringify(user));
          $location.url('/users/'+user._id);
        })
        .error(function(){
          // Error: authentication failed
          $rootScope.message = 'Authentication failed.';
          $location.url('/login');
        });
    };

}]);


mp4Controllers.controller('SignUpController', ['$scope', '$window','$http', '$rootScope', '$location', function($scope, $window, $http, $rootScope, $location) {


    $scope.user = '';
    $rootScope.curr_user = '';
    $scope.signup = function(){
        $http.post('/signup', {
          name: $scope.user.name,
          email: $scope.user.email,
          password: $scope.user.password,
          phoneNumber: $scope.user.phoneNumber,
          gender: $scope.user.gender,
          image: $scope.user.image,
          attending: [],
          hosting: [],
          history: [],
          following: []
        })
        .success(function(user){
          // No error: authentication OK
          $rootScope.curr_user = user;
            $window.sessionStorage.setItem('curr_user', JSON.stringify(user));
          $location.url('/users/'+user._id);
        })
        .error(function(){
          // Error: authentication failed
          $rootScope.message = 'Signup failed.';
          $location.url('/signup');
        });
    };

}]);

mp4Controllers.controller('AddEventController', ['$scope', '$window', '$rootScope', '$routeParams','Users','Events','$http', function($scope, $window,$rootScope, $routeParams,Users, Events,$http) {
    $rootScope.curr_user = JSON.parse($window.sessionStorage.curr_user);
$scope.data = {};
$scope.foodStyles = 'American';

$scope.addEvent = function(){

	console.log($rootScope.curr_user.local.name);
	console.log($rootScope.curr_user._id);
    var newData = {
      name: $scope.data.name,
      time: $scope.data.date,
      hour: $scope.data.time,
      place: $scope.data.place,
      description: $scope.data.description,
      host: $rootScope.curr_user.local.name,
      hostId: $rootScope.curr_user._id,
      attending: [],
      maximumLimit: $scope.data.limit,
      completed: false,
      foodstyle: $scope.foodStyles,
      occassion: $scope.data.occasion
    }

    console.log(newData);

    Events.addEvent(newData)
        .success(function(data){
        $scope.errorMessage = "";
        $scope.successMessage = "Event " + data.data.name + " has been added!";

        Users.getUser($rootScope.curr_user._id).success(function(data1){
            data1.data.local.hosting.push(data.data._id);
            Users.updateUser($rootScope.curr_user._id,data1.data.local).success(function(data2){
                Users.getUser($rootScope.curr_user._id).success(function(user){
                    $rootScope.curr_user = user.data;
                    $window.sessionStorage.setItem('curr_user', JSON.stringify(user.data));
                });
                console.log('updated to host events array');
            });
        });

    }).error(function(err){
        if(err) {
          $scope.errorMessage = err.message;
          $scope.successMessage = "";
          console.log("fail to add Event"+err);
        }
    });

};
}]);
