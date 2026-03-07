<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'alias' => 'required|string|max:255|unique:users,alias',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $validated['alias'],
            'alias' => $validated['alias'],
            'email' => $validated['alias'] . '@agency.local', // dummy email
            'password' => Hash::make($validated['password']),
            'fame' => 0,
            'prestige' => 0,
            'rank' => 'ROOKIE'
        ]);

        $token = $user->createToken('veritas_access_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'alias' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('alias', $credentials['alias'])->first();

        // Fallback to name if alias not found
        if (!$user) {
            $user = User::where('name', $credentials['alias'])->first();
        }

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid clearance code.'], 401);
        }

        $token = $user->createToken('veritas_access_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }
}
