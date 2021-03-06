(function () {
    'use strict';

    angular
        .module('myclasses')
        .controller('MyclassesListController', MyclassesListController);

    MyclassesListController.$inject = ['$window', 'MyclassesService', 'Authentication', 'UserclassesService'];

    function MyclassesListController($window, MyclassesService, Authentication, UserclassesService) {
        var vm = this;

        vm.myclasses = MyclassesService.query();	// Grabs all of the classes from the db
        vm.authentication = Authentication;			// Grabs current user info from db
        vm.userclasses = [];                        // User's classes array

        vm.findCourses = function(){
            // Find the user's classes through the factory
            UserclassesService.getUserclasses().then(function(response){
                for(var i = 0; i < response.data.courses.length; i++){
                    // Push the courses into the user's class list
                    vm.userclasses.push(response.data.courses[i]);
                }
                console.log(vm.userclasses);
            });
        }

        vm.addCourse = function(myclass) {			// Add a course to the user's classes
            // Find the index of the class
            var index = vm.myclasses.indexOf(myclass);

            // Add class to the user's classes on the front end
            vm.userclasses.push(vm.myclasses[index]);

            // Add the course to the user's list of classes on the db
            UserclassesService.updateUserclasses(myclass);

            // Alert the user that the class was added
            window.alert('Class added');
        }

        vm.deleteCourse = function(userclass) {     // Delete a course from the user's classes
            if($window.confirm('Are you sure you want to delete the class?')) {
                // Find in the index of the course in user's classes
                var index = vm.userclasses.indexOf(userclass);  

                // Delete from the list on the front end
                vm.userclasses.splice(index, 1);

                console.log(userclass);

                // Delete the class from the user's list of classes through the factory service
                UserclassesService.deleteUserclass(userclass);
            }
        }

        vm.checkIfAdded = function(myclass) {       // Check if myclass is in userclasses
            // Loop through the user's classes and check if myclass is there
            for(var i = 0; i < vm.userclasses.length; i++){
                if(vm.userclasses[i].courseCode == myclass.courseCode)
                    return true;
            }

            return false;
        }
    }
}());
