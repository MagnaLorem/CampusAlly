'use strict';


// Create the 'chat' controller
angular.module('chat').controller('ChatController', ['$scope', '$location', 'Authentication', 'Socket','chatService', 'UserclassesService',
  function ($scope, $location, Authentication, Socket, chatService, UserclassesService) {
    // Create a messages array
    $scope.messages = [];
    $scope.UserName = Authentication.user.username;
    $scope.classes = [];
    $scope.currentlySelectedClassID;
    $scope.isDefaultSet = false;
    //used to get the course code for a selected class to display above chats
    $scope.currentlySelectedCourseCode;


    // If user is not signed in then redirect back home
    if (!Authentication.user) {
      $location.path('/');
    }

    // Make sure the Socket is connected
    if (!Socket.socket) {
      Socket.connect();
    }

    // Add an event listener to the 'chatMessage' event
    Socket.on('chatMessage', function (message) {
      $scope.messages.push(message);
    });

    $scope.setDefaultClassId = function(selectedClass){

      if(!$scope.isDefaultSet){
        $scope.currentlySelectedClassID = selectedClass.classId;
        //set the course code for the chat title
        $scope.currentlySelectedCourseCode = selectedClass.courseCode;

        // Switch which room to chat to
        switchRoom();

        //retreived the default chat history
        if(!$scope.isDefaultSet){
          chatService.getAllChatData($scope.currentlySelectedClassID)
          .then(function(response){
            getMessagesForSelectedClass(response);
          },function(err){
            console.log(err);
          });
        }

        $scope.isDefaultSet = true;
      }
    }

    function getMessagesForSelectedClass(response){
      $scope.messages = [];

      if(response.data != null){//if the selected class has no conversation
        for(var i = 0;i<response.data.messages.length;i++){
          $scope.messages.push(response.data.messages[i]);
        }
      }

      console.log($scope.messages);
    }
    //check if message array is empty
      $scope.noMessages = function(){
        if($scope.messages.length === 0 && $scope.classes.length > 0){
          return true;
        }
      }
      //check if classes array and message array are empty
      $scope.noMessagesAndNoClasses = function(){
          if($scope.classes.length === 0 && $scope.messages.length === 0){
              return true;
          }
      }


    // function not used
    $scope.getClassInfoOnChatPage = function(selectedClass){
      $scope.currentlySelectedClassID = selectedClass.classId;
      console.log("currentlySelectedClassID : " + $scope.currentlySelectedClassID+"\n");

    }// end of getClassInfoOnChatPage

    $scope.getAllCourses = function(){
      // Find the user's classes through the factory
      UserclassesService.getUserclasses().then(function(response){
        for(var i = 0; i < response.data.courses.length; i++){
           // Push the courses into the user's class list
            $scope.classes.push(response.data.courses[i]);
          }
      });
    }

    $scope.retrieveSelectedChat = function(selectedClass){

      if($scope.currentlySelectedClassID != selectedClass.classId){
        //update the selected classID
        $scope.currentlySelectedClassID = selectedClass.classId;
        //update the currently course code for the title
        $scope.currentlySelectedCourseCode = selectedClass.courseCode;

        // Switch which room to chat to
        switchRoom();

        chatService.getAllChatData($scope.currentlySelectedClassID)
          .then(function(response){
            getMessagesForSelectedClass(response);
          },function(err){
            console.log(err);
          });

      }
    }

    // Create a controller method for sending messages
    $scope.sendMessage = function () {

      //create a object to save to db
      var chatData = {
        "username": Authentication.user.username,
        "profileImageURL": Authentication.user.profileImageURL,
        "message" : this.messageText,
        "created" : Date.now(),
        "classID" : $scope.currentlySelectedClassID
      }

      console.log(chatData);
      //check if the message is empty
      if(this.messageText != '' && typeof(this.messageText) !== 'undefined'){
        chatService.saveChatData(chatData)
          .then(function(response){
            console.log("succefully saved chat data");
          },function(err){
            console.log(err);
        });
        
        // Emit a 'chatMessage' message event
        Socket.emit('chatMessage', chatData);

        // Clear the message text
        this.messageText = '';
      }
    };

    // Remove the event listener when the controller instance is destroyed
    $scope.$on('$destroy', function () {
      Socket.removeListener('chatMessage');
    });

    // Function to switch the chat room
    function switchRoom(){
      // Grab the current classId and convert it to String
      var room = $scope.currentlySelectedClassID.toString();

      // Switch rooms using socket.io function
      Socket.emit('switchRoom', room);
    }
  }

]);




