<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class FirebaseTokenVerifier
{
    public function verify(string $token): ?array
    {
        try {
            $parts = explode('.', $token);
            if (count($parts) !== 3) return null;

            $payload = json_decode(base64_decode(str_pad(strtr($parts[1], '-_', '+/'), strlen($parts[1]) + (4 - strlen($parts[1]) % 4) % 4, '=')), true);
            if (!$payload) return null;

            if (($payload['exp'] ?? 0) < time()) return null;
            if (($payload['aud'] ?? '') !== config('services.firebase.project_id')) return null;

            $kid = json_decode(base64_decode(str_pad(strtr($parts[0], '-_', '+/'), strlen($parts[0]) + (4 - strlen($parts[0]) % 4) % 4, '=')), true)['kid'] ?? null;
            if (!$kid) return null;

            $certs = Cache::remember('firebase_certs', 3600, function () {
                $resp = Http::get('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
                return $resp->json();
            });

            if (!isset($certs[$kid])) return null;

            $pubKey = openssl_get_publickey($certs[$kid]);
            if (!$pubKey) return null;

            $data      = $parts[0] . '.' . $parts[1];
            $signature = base64_decode(str_pad(strtr($parts[2], '-_', '+/'), strlen($parts[2]) + (4 - strlen($parts[2]) % 4) % 4, '='));

            if (openssl_verify($data, $signature, $pubKey, OPENSSL_ALGO_SHA256) !== 1) return null;

            return $payload;
        } catch (\Throwable) {
            return null;
        }
    }
}
