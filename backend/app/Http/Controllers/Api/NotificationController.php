<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $notifications = Notification::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json($notifications);
    }

    public function markAsRead(string $id): JsonResponse
    {
        $notification = Notification::where('user_id', auth()->id())
            ->find($id);

        if ($notification) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function unreadCount(): JsonResponse
    {
        $count = Notification::where('user_id', auth()->id())
            ->whereNull('read_at')
            ->count();

        return response()->json(['unread_count' => $count]);
    }
}
