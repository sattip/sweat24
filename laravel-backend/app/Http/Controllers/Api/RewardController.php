<?php

namespace App\Http\Controllers\Api;

use App\Models\Reward;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RewardController extends BaseController
{
    /**
     * Display user's rewards.
     */
    public function index(Request $request): JsonResponse
    {
        $rewards = $request->user()
                          ->rewards()
                          ->orderBy('created_at', 'desc')
                          ->get();

        return $this->sendResponse($rewards, 'Rewards retrieved successfully.');
    }

    /**
     * Use a reward.
     */
    public function use($id, Request $request): JsonResponse
    {
        $reward = Reward::where('id', $id)
                       ->where('user_id', $request->user()->id)
                       ->where('status', 'available')
                       ->first();

        if (!$reward) {
            return $this->sendError('Reward not found or not available.');
        }

        // Check if reward is expired
        if ($reward->expires_at && $reward->expires_at < now()) {
            $reward->update(['status' => 'expired']);
            return $this->sendError('Reward has expired.');
        }

        $reward->update([
            'status' => 'used',
            'used_at' => now(),
        ]);

        return $this->sendResponse($reward, 'Reward used successfully.');
    }

    /**
     * Display the specified reward.
     */
    public function show($id, Request $request): JsonResponse
    {
        $reward = Reward::where('id', $id)
                       ->where('user_id', $request->user()->id)
                       ->first();

        if (!$reward) {
            return $this->sendError('Reward not found.');
        }

        return $this->sendResponse($reward, 'Reward retrieved successfully.');
    }
}