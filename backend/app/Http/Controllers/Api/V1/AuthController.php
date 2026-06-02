<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\FirebaseAuthRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Mail\WelcomeEmail;
use App\Models\User;
use App\Services\FirebaseTokenVerifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    public function __construct(private FirebaseTokenVerifier $verifier) {}

    public function firebaseLogin(FirebaseAuthRequest $request): JsonResponse
    {
        $payload = $this->verifier->verify($request->validated('firebase_token'));

        if (!$payload) {
            return response()->json(['message' => 'Invalid or expired Firebase token.'], 401);
        }

        $uid   = $payload['sub'];
        $email = $payload['email'] ?? null;
        $name  = $payload['name'] ?? ($email ? explode('@', $email)[0] : 'User');
        $photo = $payload['picture'] ?? null;

        if (!$email) {
            return response()->json(['message' => 'Firebase token missing email claim.'], 422);
        }

        if ($request->boolean('check_only')) {
            $exists = User::where('firebase_uid', $uid)->orWhere('email', $email)->exists();
            return response()->json(['user_exists' => $exists]);
        }

        $wasRecentlyCreated = false;

        $user = User::where('firebase_uid', $uid)->first();

        if (!$user) {
            $user = User::where('email', $email)->first();
            if ($user) {
                $user->update(['firebase_uid' => $uid, 'name' => $name, 'avatar_url' => $photo]);
            }
        } else {
            $user->update(['name' => $name, 'email' => $email, 'avatar_url' => $photo]);
        }

        if (!$user) {
            $user = User::create([
                'firebase_uid' => $uid,
                'email'        => $email,
                'name'         => $name,
                'avatar_url'   => $photo,
            ]);
            $wasRecentlyCreated = true;
        }

        if ($wasRecentlyCreated) {
            try {
                Mail::to($user->email)->send(new WelcomeEmail($user));
            } catch (\Throwable $e) {
                Log::warning('Welcome email failed: ' . $e->getMessage());
            }
        }

        $user->tokens()->delete();
        $token = $user->createToken('sanctum-token')->plainTextToken;

        return response()->json([
            'token'  => $token,
            'user'   => new UserResource($user),
            'is_new' => $wasRecentlyCreated,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(new UserResource($request->user()));
    }
}
