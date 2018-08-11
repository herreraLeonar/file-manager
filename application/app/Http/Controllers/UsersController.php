<?php namespace App\Http\Controllers;

use Hash;
use App\User;
use Auth, Input;
use App\Services\SpaceUsage;

class UsersController extends Controller {

	public function __construct(SpaceUsage $usage)
    {
        if (IS_DEMO) {
            $this->middleware('admin', ['only' => ['destroy', 'destroyAll']]);
        } else {
            $this->middleware('admin', ['only' => ['index', 'destroy', 'destroyAll']]);
        }

        $this->middleware('loggedIn');

        $this->spaceUsage = $usage;
    }

    /**
     * Return a collection of all registered users.
     *
     * @return Collection
     */
	public function index()
	{
        return User::all();
	}

	/**
	 * Update given users information.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		$currentUser = Auth::user();
        $input       = Input::all();
        $user        = User::findOrFail($id);

        if ($currentUser->isAdmin || $currentUser->id == $user->id) {

            //has the password if we get one passed in input
            if (isset($input['password'])) {
                $input['password'] = Hash::make($input['password']);
            }

            $user->fill($input)->save();

            return response($user, 200);
        }

        return response(trans('app.noPermissions'), 403);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		return User::destroy($id);
	}

    /**
     * Delete all users given in input.
     *
     * return Response
     */
    public function destroyAll()
    {
        if ( ! Input::has('users')) return;

        $ids = [];

        foreach(Input::get('users') as $k => $user) {
            $ids[] = $user['id'];
        }

        if ($deleted = User::destroy($ids)) {
            return response(trans('app.deleted', ['number' => $deleted]));
        }
    }

    /**
     * Get disk space user is currently using.
     *
     * return int
     */
    public function getSpaceUsage()
    {
        return $this->spaceUsage->info();
    }
}
