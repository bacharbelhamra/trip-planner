<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Welcome to TripPlanner</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;">
  <h2 style="color:#534AB7;">Welcome to TripPlanner, {{ $user->name }}! 🗺️</h2>
  <p>Your account is ready. Start planning your first AI-powered trip today.</p>
  <a href="{{ config('app.url') }}/create-trip"
     style="display:inline-block;background:#534AB7;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:500;">
    Plan my first trip
  </a>
</body>
</html>
