<?php

namespace App\Http\Controllers;

use App\Models\Referral;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function index()
    {
        return Referral::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|integer',
            'friend_name' => 'required',
            'friend_email' => 'required|email',
        ]);

        return Referral::create($data);
    }

    public function show(Referral $referral)
    {
        return $referral;
    }

    public function update(Request $request, Referral $referral)
    {
        $referral->update($request->all());
        return $referral;
    }

    public function destroy(Referral $referral)
    {
        $referral->delete();
        return response()->noContent();
    }
}
