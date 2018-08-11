'use strict';

angular.module('app').controller('UsersController', ['$scope', '$rootScope', '$state', '$mdDialog', 'utils', 'users', function($scope, $rootScope, $state, $mdDialog, utils, users) {
    $scope.users = users;

    //users search query
    $scope.search = { query: '' };

    $scope.selectedItems = [];

    $scope.isItemSelected = function(item) {
        return $scope.selectedItems.indexOf(item) > -1;
    };

    $scope.select = function(item) {
        var idx = $scope.selectedItems.indexOf(item);
        if (idx > -1) $scope.selectedItems.splice(idx, 1);
        else $scope.selectedItems.push(item);
    };

    //filter model for checkbox to filter photos attach/not attached to user
    $scope.showNotAttachedPhotosOnly = false;

    $scope.deleteUsers = function() {
        if (utils.isDemo) {
            utils.showToast('Sorry, you can\'t do that on demo site.');
            $scope.selectedItems = [];
            return;
        }

        users.delete($scope.selectedItems).success(function() {
            $scope.selectedItems = [];
        }).error(function(data) {
            utils.showToast(data);
        })
    };

    $scope.toggleAllUsers = function() {

        //all items already selected, deselect all
        if ($scope.selectedItems.length === users.all.length) {
            $scope.selectedItems = [];
        }

        //all items aren't selected, copy all users array to selected items
        else {
            $scope.selectedItems = users.all.slice();
        }
    };

    $scope.showUserModal = function(user, $event) {
        $mdDialog.show({
            templateUrl: 'assets/views/modals/edit-user.html',
            targetEvent: $event,
            clickOutsideToClose: true,
            controller: ['$scope', 'users', function($scope, users) {
                $scope.users = users;

                if (user) {
                    $scope.userModel = angular.copy(user);
                    delete $scope.userModel.password;
                    delete $scope.userModel.id;
                    $scope.type = 'edit';
                } else {
                    $scope.type = 'create';
                }

                $scope.submit = function() {
                    if (utils.isDemo) {
                        utils.showToast('Sorry, you can\'t do that on demo site.');
                        $scope.selectedItems = [];
                        return;
                    }

                    var method = $scope.type === 'create' ? 'register' : 'updateAccountSettings';

                    users[method]($scope.userModel, user ? user.id : null).error(function(data) {
                        $('.user-modal .errors').html('');

                        //if we've got back just a string show it in a toast
                        if (angular.isString(data)) {
                            return utils.showToast(data);
                        }

                        //otherwise append each error to user modal
                        for (var field in data) {
                            $('.user-modal .errors').append('<div class="error">'+data[field][0]+'</div>');
                        }
                    }).success(function(data) {
                        users.closeModal();

                        if ($scope.type === 'create') {
                            utils.showToast('createdUserSuccessfully', true);
                            users.all.push($scope.userModel);
                        } else {
                           utils.showToast('updatedUserSuccessfully', true);

                            for (var i = 0; i < users.all.length; i++) {
                                if (users.all[i].id == data.id) {
                                    users.all[i] = $scope.userModel; break;
                                }
                            }
                        }

                        $scope.userModel = {};
                    })
                };
            }]
        });
    };

    $scope.usersAjaxInProgress = true;

    users.getAll().finally(function() {
        $scope.usersAjaxInProgress = false;
    })
}]);
