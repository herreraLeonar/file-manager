<?php namespace App\Http\Controllers;

use App;
use App\File;
use Input, Auth;
use App\Http\Requests;
use App\Services\FileSaver;
use App\Services\Photo\Deleter;

class FilesController extends Controller {

    public function __construct(FileSaver $saver, Deleter $deleter)
    {
        $this->middleware('loggedIn', ['except' => 'store']);
        $this->middleware('spaceUsage', ['only' => 'store']);

        $this->saver = $saver;
        $this->deleter = $deleter;
        $this->user = Auth::user();
    }

    /**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
        if (Input::get('all') === 'true' && ($this->user->isAdmin || IS_DEMO)) {
            return File::withTrashed()->with('User')->orderBy('updated_at', 'desc')->limit(1000)->get();
        } else {
            return Auth::user()->files()->get(['name', 'description', 'file_name', 'folder_id', 'id', 'user_id']);
        }
	}

	/**
	 * Find photo with given id.
	 *
	 * @param  int  $id
	 * @return File
	 */
	public function show($id)
	{
        return Auth::user()->files()->findOrFail($id);
	}

    /**
     * Store a new file.
     *
     * @return array|void
     */
    public function store()
    {
        //store uploaded file
        if (Input::file()) {
            return $this->saver->saveFiles(Input::file(), Input::get('folder'), Input::get('attach_id'));
        }
    }

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		$file = Auth::user()->files()->findOrFail($id);

        $file->update(Input::all());

        return $file;
	}

    /**
     * Update files with specified ids.
     *
     * @return int
     */
    public function updateAll()
    {
        return Auth::user()->files()->whereIn('id', Input::get('ids'))->update(Input::get('data'));
    }

    /**
     * Return photos user has recently uploaded or modified.
     *
     * @return mixed
     */
    public function recent()
    {
        return Auth::user()->files()->orderBy('updated_at', 'desc')->limit(30)->get();
    }
}
