'use strict';

angular.module('app').controller('FilesController', ['$scope', '$rootScope', 'utils', '$http', '$mdDialog', 'files', 'folders', 'deleter', 'fileTypes', function($scope, $rootScope, utils, $http, $mdDialog, files, folders, deleter, fileTypes) {
    $scope.files = files;
    $scope.allItems = [];
    $scope.fileTypes = fileTypes;
    $scope.utils = utils;

    //files search query
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

    $scope.deleteItems = function() {
        if (utils.isDemo) {
            utils.showToast('Sorry, you can\'t do that on demo site.');
            $scope.selectedItems = [];
            return;
        }

        deleter.delete($scope.selectedItems);

        if ( ! utils.isDemo) {
            $scope.allItems = $scope.allItems.filter(function(item) {
                return $scope.selectedItems.indexOf(item) === -1;
            });
        }

        $scope.selectedItems = [];
    };

    $scope.toggleAllPhotos = function() {

        //all items already selected, deselect all
        if ($scope.selectedItems.length === $scope.allItems.length) {
            $scope.selectedItems = [];
        }

        //all items arent selected, copy all photos array to selected items
        else {
            $scope.selectedItems = $scope.allItems.slice();
        }
    };

    $scope.showUserModal = function(user, $event) {
        $mdDialog.show({
            template: $('#user-modal').html(),
            targetEvent: $event,
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
                    var method = $scope.type === 'create' ? 'register' : 'updateAccountSettings';

                    users[method]($scope.userModel, user.id).error(function(data) {
                        $('.user-modal .errors').html('');

                        for (var field in data) {
                            $('.user-modal .errors').append('<div class="error">'+data[field][0]+'</div>');
                        }
                    }).success(function() {
                        users.closeModal();

                        if ($scope.type === 'create') {
                            $rootScope.showToast('createdUserSuccessfully', true);
                            users.all.push($scope.userModel);
                        } else {
                            $rootScope.showToast('updatedUserSuccessfully', true);

                            for (var i = 0; i < users.all.length; i++) {
                                if (users.all[i].id == user.id) {
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

    $scope.itemsAjaxInProgress = true;

    if (utils.stateIs('admin.files')) {
        var promise = files.getAll(true);
    } else if (utils.stateIs('admin.folders')) {
        var promise = folders.getAll(true);
    }

    promise.success(function(data) {
        $scope.allItems = data;
    }).finally(function() {
        $scope.itemsAjaxInProgress = false;
    })
}]);
